// src/pages/api/service/payment/reset-subscription.ts

import { Database } from '@/lib/database.types';
import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { addDays, addMonths } from 'date-fns';
import getStripeInstance from '../../stripe/createClient';
import { statusMap } from '../../utils/stripeStatusMap';

export interface ResetSubscriptionRequestParams {
  subscriptionId: string;
  interval: string | null;
  intervalCount: number | null;
}

export default async function resetSubscription(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const stripe = getStripeInstance();
    const { subscriptionId, interval, intervalCount } =
      req.body as ResetSubscriptionRequestParams;

    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      }
    );

    const newStartDate = new Date();
    let newEndDate = new Date(newStartDate);

    if (interval === 'day' && intervalCount) {
      newEndDate = addDays(newStartDate, intervalCount);
    } else if (interval === 'month' && intervalCount) {
      newEndDate = addMonths(newStartDate, intervalCount);
    } else {
      newEndDate = addMonths(newStartDate, 1);
    }

    const updatedStripeSub = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
      proration_behavior: 'none',
      trial_end: Math.floor(newEndDate.getTime() / 1000),
    });

    const newStatus = statusMap[updatedStripeSub.status] || 'active';

    const { error: subError } = await supabase
      .from('patient_subscription')
      .update({
        status: newStatus,
        current_period_start: newStartDate.toISOString(),
        current_period_end: newEndDate.toISOString(),
      })
      .eq('reference_id', subscriptionId);

    const { error: presError } = await supabase
      .from('patient_prescription')
      .update({
        status: newStatus,
        current_period_start: newStartDate.toISOString(),
        current_period_end: newEndDate.toISOString(),
      })
      .eq('reference_id', subscriptionId);

    if (subError || presError) {
      throw new Error(subError?.message || presError?.message);
    }

    console.info(
      `Subscription ${subscriptionId} reset from ${newStartDate.toISOString()} to ${newEndDate.toISOString()}`
    );
    res.status(200).json({
      subscriptionId,
      current_period_start: newStartDate.toISOString(),
      current_period_end: newEndDate.toISOString(),
    });
  } catch (err: any) {
    console.error('Error resetting subscription period:', err);
    res.status(500).json({
      message: err?.message || 'Unexpected error resetting subscription',
    });
  }
}
