import type { NextApiRequest, NextApiResponse } from 'next';
import { createAuthToken } from './createToken';
import { getServiceSupabase } from '@/utils/supabase';
import { getUnixTime, parseISO } from 'date-fns';
import { PatientAddress } from '@/components/hooks/data';
import { carriers } from '@/utils/carriers';
import { MessageGroup } from '@/types/messageItem';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

type Patient = {
  profile: {
    email: string | null;
    id: string | null;
    first_name: string | null;
  };
};

type Clinician = {
  clinician: {
    profile_id: string | null;
  };
};

const kitMessage = async (
  customer: Patient['profile'],
  supabase: SupabaseClient<Database>,
  patientAddress: PatientAddress
) => {
  if (!customer?.id) {
    throw new Error('Customer id missing');
  }
  const patientMessageGroup = await supabase
    .from('messages_group')
    .select()
    .eq('profile_id', customer.id)
    .eq('name', 'Enclomiphene')
    .single()
    .then(({ data }) => data as unknown as MessageGroup);
  console.log({ patientMessageGroup });

  // find group members
  const groupMember = await supabase
    .from('messages_group_member')
    .select('clinician!inner(profile_id)')
    .eq('messages_group_id', patientMessageGroup.id)
    .limit(1)
    .maybeSingle()
    .then(({ data }) => data as Clinician);

  if (!groupMember) {
    throw new Error(
      `Cannot find group member for Enclomiphene Message group ${patientMessageGroup.id}`
    );
  }

  let template = await supabase
    .from('clinician_macro')
    .select('template')
    .eq('name', 'Coordinator - Enclomiphene - Test kit sent')
    .single()
    .then(({ data }) => data?.template);
  console.log({ patientMessageGroup });

  if (!template) {
    throw new Error(
      'Cannot find template for "Coordinator - Enclomiphene - Test kit sent"'
    );
  }

  const patientDeliveryAddress = patientAddress
    ? `${patientAddress.address_line_1}${
        !!patientAddress?.address_line_2
          ? ' ' + patientAddress?.address_line_2
          : ''
      }, ${patientAddress.city}, ${patientAddress.state} ${
        patientAddress.zip_code
      }`
    : '';

  template = template.replaceAll(
    '{{DELIVERY_ADDRESS}}',
    patientDeliveryAddress
  );
  template = template.replaceAll(
    '{{PATIENT_FIRST_NAME}}',
    customer.first_name ?? ''
  );

  const messageParams = {
    sender: `${groupMember?.clinician?.profile_id}`,
    recipient: `${customer?.id}`,
    message: template,
    notify: false,
    groupId: patientMessageGroup?.id,
    initialMessage: false,
    is_phi: false,
  };

  await supabase.from('messages-v2').insert(messageParams);
};

export default async function tassoPlaceOrderHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const supabase = getServiceSupabase();
    const accessToken = await createAuthToken();

    const { tassoOrder } = req.body;

    const getTrackingURL = (trackingNumber: string) => {
      const found = carriers.find(c => c.reg.test(trackingNumber));

      if (found) {
        return found.url(trackingNumber);
      }

      return null;
    };

    const customer = await supabase
      .from('patient')
      .select('profile: profiles(email, id, first_name)')
      .eq('id', tassoOrder?.patient_id)
      .single()
      .then(({ data }) => (data as unknown as Patient)?.profile);

    const patientAddress = await supabase
      .from('address')
      .select()
      .eq('patient_id', tassoOrder?.patient_id)
      .maybeSingle()
      .then(({ data }) => data as unknown as PatientAddress);
    console.log({ patientAddress });

    const tassoOrderData = await fetch(
      `${process.env.TASSO_ENVIRONMENT}/orders/${tassoOrder?.tasso_order_id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
      .then(res => res.json())
      .catch(err => err);
    console.log('ORDER', tassoOrderData);

    if (
      tassoOrderData &&
      tassoOrderData?.results?.tracking?.toPatient?.trackingNumber &&
      !tassoOrder?.tasso_tracking_number
    ) {
      const update = await supabase
        .from('lab_order')
        .update({
          tasso_tracking_number:
            tassoOrderData?.results?.tracking?.toPatient?.trackingNumber,
          tracking_url: getTrackingURL(
            tassoOrderData?.results?.tracking?.toPatient?.trackingNumber
          ),
        })
        .eq('patient_id', tassoOrder.patient_id);

      await kitMessage(customer, supabase, patientAddress);

      const newTrackingNumber = await fetch(
        'https://api.perfalytics.com/track',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: 'enclomiphene-labs-tracking-number',
            properties: {
              distinct_id: customer?.id,
              email: customer.email,
              order_id: tassoOrder?.tasso_order_id,
              tracking_number:
                tassoOrderData?.results?.tracking?.toPatient?.trackingNumber,
              tracking_url: getTrackingURL(
                tassoOrderData?.results?.tracking?.toPatient?.trackingNumber
              ),
              ordered_at: getUnixTime(parseISO(tassoOrder.created_at)),
              address1: patientAddress?.address_line_1,
              address2: patientAddress?.address_line_2,
              city: patientAddress?.city,
              state: patientAddress?.state,
              zip_code: patientAddress?.zip_code,
              token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
              $user_agent:
                'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
              $current_url: 'https://app.getzealthy.com',
            },
          }),
        }
      );
      console.log(
        JSON.stringify(update),
        { newTrackingNumber },
        'enclomiphene-labs-tracking-number-comms'
      );

      console.log(
        'new_tracking_tasso',
        { newTrackingNumber, update },
        'update',
        'enclomiphene-labs-tracking-number-comms'
      );
    }

    if (
      tassoOrderData &&
      tassoOrderData.results.status === 'inTransitToPatient' &&
      tassoOrder?.status !== 'inTransitToPatient'
    ) {
      const updateStatus = await supabase
        .from('lab_order')
        .update({
          status: tassoOrderData?.results?.status,
          date_shipped: new Date(),
        })
        .eq('patient_id', tassoOrder?.patient_id);
    }

    if (
      tassoOrderData &&
      tassoOrderData.results.status === 'atPatient' &&
      tassoOrder?.status !== 'atPatient'
    ) {
      const updateStatus = await supabase
        .from('lab_order')
        .update({
          status: tassoOrderData?.results?.status,
          date_delivered: new Date(),
        })
        .eq('patient_id', tassoOrder?.patient_id);
      const deliveredOrder = await fetch('https://api.perfalytics.com/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'Enclomiphene-labs-delivered',
          properties: {
            distinct_id: customer?.id,
            email: customer.email,
            order_id: tassoOrder?.tasso_order_id,
            tracking_number:
              tassoOrderData?.results?.tracking?.toPatient?.trackingNumber,
            tracking_url: getTrackingURL(
              tassoOrderData?.results?.tracking?.toPatient?.trackingNumber
            ),
            address1: patientAddress?.address_line_1,
            address2: patientAddress?.address_line_2,
            city: patientAddress?.city,
            state: patientAddress?.state,
            zip_code: patientAddress?.zip_code,
            token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
            $user_agent:
              'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
            $current_url: 'https://app.getzealthy.com',
          },
        }),
      });
      console.log(
        'enclomiphene-labs-tracking-number-comms',
        { deliveredOrder, updateStatus },
        'update'
      );
    }

    if (
      tassoOrderData &&
      tassoOrderData.results.status === 'inTransitToLab' &&
      tassoOrder?.status !== 'inTransitToLab'
    ) {
      const updateStatus = await supabase
        .from('lab_order')
        .update({
          status: tassoOrderData?.results?.status,
          date_shipped: new Date(),
        })
        .eq('patient_id', tassoOrder?.patient_id);
    } else if (
      tassoOrderData &&
      tassoOrderData.results.status === 'atLab' &&
      tassoOrder?.status !== 'atLab'
    ) {
      await supabase
        .from('lab_order')
        .update({
          status: tassoOrderData?.results?.status,
          date_delivered: new Date(),
        })
        .eq('patient_id', tassoOrder?.patient_id);
    } else {
      console.log('No update needed');
    }
    return res.status(200).json({ message: 'Order placed successfully' });
  } catch (err) {
    console.error(err);

    return res.status(500).json(err);
  }
}
