import { Database } from '@/lib/database.types';
import { MedicationSubscriptionRequestParams } from '@/types/api/create-medication-subscription';
import { daysFromNow, monthsFromNow } from '@/utils/date-fns';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';
import getStripeInstance from '../../stripe/createClient';
import { calculatedSpecificCare } from '../../utils/calculate-specific-care';

const functionMap: { [key: string]: Function } = {
  day: daysFromNow,
  month: monthsFromNow,
};

export default async function createMedicationSubscription(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  const {
    patientId,
    cancel_at,
    price,
    recurring,
    orderId,
    drugCode,
    idempotencyKey,
  } = req.body as MedicationSubscriptionRequestParams;
  try {
    // create supabase client
    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    const customer_id = await supabase
      .from('payment_profile')
      .select('customer_id')
      .eq('patient_id', patientId)
      .single()
      .then(({ data }) => data?.customer_id);

    if (!customer_id) {
      const message = `Could not find stripe "customer_id" for patient: ${patientId}`;
      console.log(message);
      throw new Error(message);
    }

    const zealthyCare = await calculatedSpecificCare(drugCode || '');

    const response = await stripe.subscriptions.create(
      {
        customer: customer_id,
        collection_method: 'charge_automatically',
        cancel_at: cancel_at,
        trial_end: functionMap[recurring.interval || 'month'](
          recurring.interval_count
        ),
        items: [
          {
            price_data: {
              unit_amount: price,
              currency: 'usd',
              product:
                process.env.VERCEL_ENV === 'production'
                  ? 'prod_NwpuVp8xHH6YNK'
                  : 'prod_NsjVtgm1CFPTJq',
              recurring: recurring,
            },
          },
        ],
        metadata: {
          zealthy_patient_id: patientId,
          zealthy_subscription_id: 5,
          zealthy_order_id: orderId,
          zealthy_care: zealthyCare,
        },
      },
      { idempotencyKey }
    );

    if (response?.id) {
      console.info(`Successfully created subscription: ${response.id}`, {
        response,
      });
      res.status(200).json(response);
    } else {
      throw new Error(
        `There was an error creating subscription for order: ${orderId} and patient: ${patientId}.`
      );
    }
  } catch (err) {
    console.error(
      `Error creating subscription for order: ${orderId} and patient: ${patientId}.`,
      {
        error: err,
      }
    );
    res.status(500).json({
      message:
        (err as Error).message ||
        `Something went wrong when creating subscription for order: ${orderId} and patient: ${patientId}`,
      error: err,
    });
  }
}
