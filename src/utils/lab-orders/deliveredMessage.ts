import { LabOrder, PatientAddress } from '@/components/hooks/data';
import { Database } from '@/lib/database.types';
import { MessageGroup } from '@/types/messageItem';
import { SupabaseClient } from '@supabase/supabase-js';
import { getUnixTime, parseISO } from 'date-fns';
import { carriers } from '../carriers';

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

const getTrackingURL = (trackingNumber: string) => {
  const found = carriers.find(c => c.reg.test(trackingNumber));

  if (found) {
    return found.url(trackingNumber);
  }

  return null;
};
export const shippedMessage = async (
  patientId: number,
  supabase: SupabaseClient<Database>,
  order: LabOrder
) => {
  const customer = await supabase
    .from('patient')
    .select('profile: profiles(email, id, first_name)')
    .eq('id', patientId)
    .single()
    .then(({ data }) => (data as unknown as Patient)?.profile);

  const patientAddress = await supabase
    .from('address')
    .select()
    .eq('patient_id', patientId)
    .maybeSingle()
    .then(({ data }) => data as unknown as PatientAddress);

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
    message_encrypted: template,
    notify: false,
    messages_group_id: patientMessageGroup?.id,
    is_phi: false,
  };

  await supabase.from('messages-v2').insert(messageParams);

  const newTrackingNumber = await fetch('https://api.perfalytics.com/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event: 'enclomiphene-labs-tracking-number',
      properties: {
        distinct_id: customer?.id,
        email: customer.email,
        order_id: order.id,
        tracking_number: order.tasso_tracking_number,
        tracking_url: getTrackingURL(order.tasso_tracking_number!),
        ordered_at: getUnixTime(parseISO(order.created_at || '')),
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
};

export const deliveredEvent = async (
  patientId: number,
  supabase: SupabaseClient<Database>,
  order: LabOrder
) => {
  const customer = await supabase
    .from('patient')
    .select('profile: profiles(email, id, first_name)')
    .eq('id', patientId)
    .single()
    .then(({ data }) => (data as unknown as Patient)?.profile);

  const patientAddress = await supabase
    .from('address')
    .select()
    .eq('patient_id', patientId)
    .maybeSingle()
    .then(({ data }) => data as unknown as PatientAddress);

  if (!customer?.id) {
    throw new Error('Customer id missing');
  }
  await fetch('https://api.perfalytics.com/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event: 'Enclomiphene-labs-delivered',
      properties: {
        distinct_id: customer?.id,
        email: customer.email,
        order_id: order?.tasso_order_id,
        tracking_number: order.tasso_tracking_number,
        tracking_url: order.tracking_url
          ? order.tracking_url
          : getTrackingURL(order.tasso_tracking_number!),
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
};
