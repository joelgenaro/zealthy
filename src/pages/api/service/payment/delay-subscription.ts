import type { NextApiRequest, NextApiResponse } from 'next';
import { MarkSubscriptionDelayRequest } from '@/types/api/delay-subscription';
import getStripeInstance from '../../stripe/createClient';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import { getUnixTime } from 'date-fns';

/**
 * @description mark subscription for cancelation at the end of current period
 */

export default async function scheduleForCancelation(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  const { subscriptionId, resumeDate, cancel_at } =
    req.body as MarkSubscriptionDelayRequest;

  try {
    // create supabase client
    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    const response = await stripe.subscriptions.update(subscriptionId, {
      trial_end: getUnixTime(new Date(resumeDate || '')),
      proration_behavior: 'none',
      ...(cancel_at
        ? { cancel_at: getUnixTime(new Date(cancel_at || '')) }
        : []),
    });
    console.info(JSON.stringify(response), 'response');

    if (response?.id) {
      const updated = await supabase
        .from('patient_prescription')
        .update({
          status: 'trialing',
          current_period_end: new Date(resumeDate || '').toISOString(),
        })
        .eq('reference_id', subscriptionId);

      res.status(200).json('Successfully paused subscription');
    } else {
      throw new Error(
        `There was an error cancelling your subscription: ${subscriptionId}`
      );
    }
  } catch (err: any) {
    console.error(
      `There was an error cancelling your subscription: ${subscriptionId}`,
      {
        error: err,
      }
    );
    return res
      .status(500)
      .json(err?.message || 'There was an unexpected error');
  }
}
