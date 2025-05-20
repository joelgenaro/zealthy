import type { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabase';

import axios from 'axios';
import getStripeInstance from '@/pages/api/stripe/createClient';
import { addMonths } from 'date-fns';
import { getErrorMessage } from '@/utils/getErrorMessage';

export default async function EmpowerWebhookHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  try {
    const supabase = getServiceSupabase();
    const { patient, existingOrder } = req.body;

    const tokenParams = {
      method: 'POST',
      url: process.env.EMPOWER_BASE_URL + '/gettoken/post',
      headers: {
        APIKey: process.env.EMPOWER_API_KEY,
        APISecret: process.env.EMPOWER_API_SECRET,
      },
    };
    const token = await axios(tokenParams);

    console.log(token?.data, 'TOKEN');
    if (!token.data.token) {
      return;
    }

    const patientAddress = await supabase
      .from('address')
      .select()
      .eq('patient_id', patient?.id)
      .maybeSingle()
      .then(({ data }) => data);

    const patientStripe = await supabase
      .from('payment_profile')
      .select('customer_id')
      .eq('patient_id', patient?.id)
      .maybeSingle()
      .then(({ data }) => data);

    const futureDate = addMonths(new Date(), 15);
    const cancelAtTimestamp = Math.floor(futureDate.getTime() / 1000);
    const subscription = await stripe.subscriptions.create({
      customer: patientStripe?.customer_id,
      cancel_at: cancelAtTimestamp,
      items: [
        {
          price_data: {
            unit_amount: existingOrder?.total_price * 100,
            currency: 'usd',
            product:
              process.env.VERCEL_ENV === 'production'
                ? 'prod_NwpuVp8xHH6YNK'
                : 'prod_NsjVtgm1CFPTJq',
            recurring: {
              interval: 'month',
              interval_count: 3,
            },
          },
        },
      ],
      metadata: {
        zealthy_patient_id: patient?.id,
        zealthy_subscription_id: 5,
        zealthy_order_id: existingOrder?.id,
        zealthy_care: 'Skincare',
        zealthy_product: existingOrder?.prescription?.medication,
      },
    });

    if (subscription?.status === 'active') {
      if (existingOrder.prescription_id) {
        await supabase
          .from('prescription')
          .update({ subscription_id: subscription.id })
          .eq('id', existingOrder.prescription_id);
      }

      const orderParams = {
        method: 'POST',
        url: process.env.EMPOWER_BASE_URL + '/NewRx/EasyRx',
        headers: {
          token: token.data.token,
        },
        data: {
          ClientOrderId: existingOrder?.id,
          DeliveryService:
            existingOrder?.shipment_method_id === 2
              ? 'UPS Priority Overnight Saturday Refrigerated'
              : 'UPS Priority 2-Day',
          AllowOverrideDeliveryService: true,
          LFPracticeId: process.env.EMPOWER_PRACTICE_ID,
          NewRxs: [
            {
              Patient: {
                ClientPatientId: null,
                LastName: patient?.profiles?.last_name,
                FirstName: patient?.profiles?.first_name,
                Gender: patient?.profiles?.gender?.[0]?.toUpperCase(),
                DateOfBirth: patient?.profiles?.birth_date,
                Address: {
                  AddressLine1: patientAddress?.address_line_1,
                  AddressLine2: patientAddress?.address_line_2 || ',',
                  City: patientAddress?.city,
                  StateProvince: patientAddress?.state,
                  PostalCode: patientAddress?.zip_code,
                  CountryCode: 'US',
                },
                PhoneNumber: patient?.profiles?.phone_number?.slice(1),
              },
              Prescriber: {
                NPI:
                  process.env.VERCEL_ENV === 'production'
                    ? 1841216629
                    : 1689995771,
                stateLicenseNumber:
                  process.env.VERCEL_ENV === 'production'
                    ? 1841216629
                    : 1689995771,
                LastName: 'Patel',
                FirstName: 'Risheet',
                Address: {
                  AddressLine1: '429 Lenox Ave',
                  AddressLine2: null,
                  City: 'Miami Beach',
                  StateProvince: 'FL',
                  PostalCode: '33139',
                  CountryCode: 'US',
                },
                PhoneNumber: '9549038072',
              },
              Medication: {
                ItemDesignatorId: existingOrder?.prescription?.medication_id,
                DrugDescription: existingOrder?.prescription?.medication,
                EssentialCopy: existingOrder?.prescription?.medication_id,
                Quantity: 1,
                Refills: 0,
                DaysSupply: 30,
                WrittenDate: new Date(),
                SigText: existingOrder?.prescription?.dosage_instructions,
                Diagnosis: {
                  ClinicalInformationQualifier: 0,
                  Primary: {
                    Code: 'Sample',
                    Qualifier: 0,
                    Description: 'Sample description.',
                    DateOfLastOfficeVisit: {
                      Date: null,
                      DateTime: new Date(),
                    },
                  },
                },
              },
            },
          ],
        },
      };

      const empowerOrder = await axios(orderParams);

      if (empowerOrder?.data?.eipOrderId) {
        const update = await supabase
          .from('order')
          .update({
            order_status: 'SENT_TO_EMPOWER',
            empower_order_id: empowerOrder?.data?.eipOrderId,
          })
          .eq('id', existingOrder?.id);

        console.log('update', update);
      } else {
        console.log('Empower order unsuccessful', empowerOrder);
        return res
          .status(400)
          .json({ 'Empower order unsuccessful': empowerOrder });
      }
    }
    return res.status(200).json('Success');
  } catch (error: any) {
    const message = getErrorMessage(error);
    console.log(
      'ERROR:',
      error?.response?.data
        ? JSON.stringify(error?.response?.data)
        : error?.message
    );
    console.debug({ message });
    res.status(500).json(message || 'There was an unexpected error');
  }
}
