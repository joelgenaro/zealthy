import { Database } from '@/lib/database.types';
import { UpdateSubscriptionRequestParams } from '@/types/api/reactivate-subscription';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';
import getStripeInstance from '../../stripe/createClient';
import { statusMap } from '@/pages/api/utils/stripeStatusMap';

export default async function reactivateSubscription(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  const { subscriptionId } = req.body as UpdateSubscriptionRequestParams;

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
      cancel_at_period_end: false,
    });

    await Promise.all([
      supabase
        .from('patient_subscription')
        .update({
          status: statusMap[response.status],
          current_period_end: new Date(
            response.current_period_end * 1000
          ).toISOString(),
          current_period_start: new Date(
            response.current_period_start * 1000
          ).toISOString(),
        })
        .eq('reference_id', subscriptionId),
      supabase
        .from('patient_prescription')
        .update({
          status: statusMap[response.status],
          current_period_end: new Date(
            response.current_period_end * 1000
          ).toISOString(),
          current_period_start: new Date(
            response.current_period_start * 1000
          ).toISOString(),
        })
        .eq('reference_id', subscriptionId),
    ]);

    if (response?.id) {
      console.info(`Successfully reactivated subscription: ${subscriptionId}`, {
        response,
      });
      res.status(200).json(response);
    } else {
      throw new Error(
        `There was an error reactivating ${subscriptionId} subscription.`
      );
    }
  } catch (err: any) {
    console.error(`Error reactivating subscription: ${subscriptionId}`, {
      error: err,
    });
    res.status(500).json({
      message:
        (err as Error).message ||
        `Something went wrong when reactivating subscription ${subscriptionId}`,
      error: err?.message || 'There was an unexpected error',
    });
  }
}
