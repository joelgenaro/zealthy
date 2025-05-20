import { Database } from '@/lib/database.types';
import { ReplaceSubscriptionRequestParams } from '@/types/api/replace-subscription';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';
import getStripeInstance from '../../stripe/createClient';

export default async function replaceSubscription(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  const { subscription, patient_id } =
    req.body as ReplaceSubscriptionRequestParams;

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
      .eq('patient_id', patient_id)
      .single()
      .then(({ data }) => data && data.customer_id);

    const newSubscription = await stripe.subscriptions.create({
      customer: customer_id!,
      items: [{ price: subscription.planId }],
      trial_end: subscription.trialEnd,
      metadata: {
        zealthy_subscription_id: subscription.id,
        resource: 'subscription',
        zealthy_patient_id: patient_id,
      },
    });

    const existingPrescription = await supabase
      .from('prescription')
      .select('*')
      .eq('subscription_id', subscription.id)
      .maybeSingle();
    if (existingPrescription.data?.subscription_id) {
      await supabase
        .from('prescription')
        .update({ subscription_id: newSubscription?.id })
        .eq('id', existingPrescription.data.id);
    }

    const priceObject = newSubscription.items.data[0].price;

    await Promise.all([
      supabase
        .from('patient_subscription')
        .update({
          visible: false,
        })
        .eq('reference_id', subscription.reference_id),
      supabase.from('patient_subscription').insert({
        status: 'active',
        current_period_end: new Date(
          newSubscription.current_period_end * 1000
        ).toISOString(),
        current_period_start: new Date(
          newSubscription.current_period_start * 1000
        ).toISOString(),
        patient_id,
        subscription_id: subscription.id,
        reference_id: newSubscription.id,
        price: priceObject.unit_amount ? priceObject.unit_amount / 100 : null,
        interval: priceObject.recurring?.interval,
        interval_count: priceObject.recurring?.interval_count,
      }),
    ]);

    if (newSubscription?.id) {
      console.info(
        `Successfully recreated subscription: ${subscription.id} with ${newSubscription.id}`,
        {
          newSubscription,
        }
      );
      res.status(200).json({
        subscription: newSubscription,
      });
    } else {
      throw new Error(
        `There was an error recreating ${subscription.id} subscription.`
      );
    }
  } catch (err: any) {
    console.error(`Error recreating subscription: ${subscription.id}`, {
      error: err,
    });
    res.status(500).json({
      message:
        (err as Error).message ||
        `Something went wrong when recreating subscription ${subscription.id}`,
      error: err?.message || 'There was an unexpected error',
    });
  }
}
