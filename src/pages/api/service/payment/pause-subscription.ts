import type { NextApiRequest, NextApiResponse } from 'next';
import { MarkSubscriptionForPauseRequest } from '@/types/api/pause-subscription';
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

  const { subscriptionId, resumeDate } =
    req.body as MarkSubscriptionForPauseRequest;

  try {
    // create supabase client
    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const response = await stripe.subscriptions.update(subscriptionId, {
      trial_end: getUnixTime(new Date(resumeDate || '')),
      proration_behavior: 'none',
      metadata: {
        ...subscription.metadata,
        paused: 'true',
      },
    });

    await Promise.all([
      supabase
        .from('patient_subscription')
        .update({
          status: 'paused',
        })
        .eq('reference_id', subscriptionId),
      supabase
        .from('patient_prescription')
        .update({ status: 'paused' })
        .eq('reference_id', subscriptionId),
    ]);

    if (response?.id) {
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
      .status(404)
      .json(err?.message || 'There was an unexpected error');
  }
}
