import { Database } from '@/lib/database.types';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';
import getStripeInstance from '../../stripe/createClient';
import { capitalize } from '@/utils/capitalize';

export default async function createCustomerHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  const { recurringId, patient, newMedication } = req.body;

  try {
    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    if (recurringId && newMedication?.price) {
      const subscription = await stripe.subscriptions.retrieve(recurringId);
      const update = await stripe.subscriptions.update(recurringId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price_data: {
              unit_amount: newMedication?.price * 100,
              currency: 'usd',
              product: subscription.items.data[0].price.product,
              recurring: {
                interval: subscription.items.data[0].price?.recurring?.interval,
                interval_count:
                  newMedication?.interval_count ||
                  subscription.items.data[0]?.price?.recurring?.interval_count,
              },
            } as any,
          },
        ],
      });
      console.log(update, ' update');
      const medicationRequest = {
        patient_id: patient?.id,
        region: patient?.region,
        medication_quantity_id: 98,
        status: 'REQUESTED',
        specific_medication: `${capitalize(
          newMedication?.subscription_plan?.split('_')[0]
        )} weekly injection`,
        note: `Weight loss - ${capitalize(
          newMedication?.subscription_plan?.split('_')[0]
        )} - NOT BUNDLED - 1 month.  Dosage: ${newMedication?.vial_size}`,
        total_price: newMedication?.price,
        shipping_method: 1,
      };
      console.log(medicationRequest, 'medReq');
      const prescriptionRequest = await supabase
        .from('prescription_request')
        .insert(medicationRequest)
        .select()
        .maybeSingle();

      console.log(prescriptionRequest, 'pres');
      if (prescriptionRequest.status === 201 && prescriptionRequest.data?.id) {
        const addToQueue = await supabase
          .from('task_queue')
          .insert({
            task_type: 'PRESCRIPTION_REQUEST',
            patient_id: patient?.id,
            queue_type: 'Provider',
          })
          .select()
          .maybeSingle()
          .then(({ data }) => data);
        await supabase
          .from('prescription_request')
          .update({ queue_id: addToQueue?.id })
          .eq('id', prescriptionRequest.data?.id);
      }
    }

    res.status(200).json({
      message: `Successfully downgraded medication subscription`,
    });
  } catch (err) {
    console.error('downgrade-med-err', err);
    res.status(422).json({
      message: `Was not able to downgrade medication subscription`,
    });
  }
}
