import getStripeInstance from '../../stripe/createClient';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getUnixTime, addDays, addMonths, addYears } from 'date-fns';
import Stripe from 'stripe';
import { Database } from '@/lib/database.types';
import { statusMap } from '../../utils/stripeStatusMap';
import {
  createServerSupabaseClient,
  SupabaseClient,
} from '@supabase/auth-helpers-nextjs';

const updateSubscription = (
  supabase: SupabaseClient<Database>,
  subscription: Stripe.Subscription
) => {
  const patientSubscription: Database['public']['Tables']['patient_subscription']['Update'] =
    {
      current_period_start: new Date(
        subscription.current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      status: subscription.cancel_at_period_end
        ? 'scheduled_for_cancelation'
        : subscription.status === 'trialing' && subscription.metadata?.paused
        ? 'paused'
        : statusMap[subscription.status],
    };

  return supabase
    .from('patient_subscription')
    .update(patientSubscription)
    .eq('patient_id', Number(subscription.metadata.zealthy_patient_id))
    .eq('reference_id', subscription.id);
};

const createSubscription = (
  supabase: SupabaseClient<Database>,
  subscription: Stripe.Subscription,
  oldSubscription: Stripe.Subscription
) => {
  const priceObject = subscription.items.data[0].price;
  const patientSubscription: Database['public']['Tables']['patient_subscription']['Insert'] =
    {
      patient_id: Number(subscription.metadata.zealthy_patient_id),
      subscription_id: Number(subscription.metadata.zealthy_subscription_id),
      reference_id: subscription.id,
      status: statusMap[subscription.status] || subscription.status,
      current_period_start: new Date(
        subscription.current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      price: priceObject.unit_amount ? priceObject.unit_amount / 100 : null,
      interval: priceObject.recurring?.interval,
      interval_count: priceObject.recurring?.interval_count,
    };

  return Promise.all([
    supabase.from('patient_subscription').insert(patientSubscription),
    supabase
      .from('patient_subscription')
      .update({
        visible: false,
      })
      .eq('reference_id', oldSubscription.id),
  ]);
};

const calculateExpectedEnd = (
  currentPeriodStart: Date,
  interval: string,
  intervalCount: number
): Date => {
  switch (interval) {
    case 'day':
      return addDays(currentPeriodStart, intervalCount);
    case 'month':
      return addMonths(currentPeriodStart, intervalCount);
    case 'year':
      return addYears(currentPeriodStart, intervalCount);
    default:
      throw new Error('Invalid interval');
  }
};

export default async function applyCreditBalance(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  try {
    const { referenceId, trialEnd, isFromCancellation = false } = req.body;

    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    const subscription = await stripe.subscriptions.retrieve(referenceId);

    if (subscription.status === 'canceled') {
      const priceId = subscription.items.data[0].price.id;

      const newSubscription = await stripe.subscriptions.create({
        customer: subscription.customer as string,
        items: [{ price: priceId }],
        trial_end: getUnixTime(new Date(trialEnd)),
        metadata: subscription.metadata,
      });

      await createSubscription(supabase, newSubscription, subscription);

      return res
        .status(200)
        .json('Successfully applied free month to new subscription.');
    }

    const currentPeriodStart = new Date(
      subscription.current_period_start * 1000
    );
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    const { interval, interval_count } =
      subscription.items.data[0].price.recurring || {};
    if (!interval || !interval_count) {
      return res
        .status(400)
        .json({ error: 'Subscription interval data is invalid.' });
    }

    const expectedEndDate = calculateExpectedEnd(
      currentPeriodStart,
      interval,
      interval_count
    );

    const maxAllowedEndDate = calculateExpectedEnd(
      expectedEndDate,
      interval,
      0.9
    );

    if (currentPeriodEnd > maxAllowedEndDate && isFromCancellation) {
      return res.status(400).json({
        error:
          'Free month cannot be applied as the subscription has already been extended.',
      });
    }

    const options: Stripe.SubscriptionUpdateParams = {
      trial_end: getUnixTime(new Date(trialEnd)),
      proration_behavior: 'none',
    };

    if (subscription.cancel_at_period_end) {
      options.cancel_at_period_end = false;
    }

    const updatedSubscription = await stripe.subscriptions.update(
      referenceId,
      options
    );

    await updateSubscription(supabase, updatedSubscription);

    return res.status(200).json('Successfully applied free month.');
  } catch (err: any) {
    console.error('ChargeErrorCatch', err);
    return res
      .status(404)
      .json(err?.message || 'There was an unexpected error.');
  }
}
