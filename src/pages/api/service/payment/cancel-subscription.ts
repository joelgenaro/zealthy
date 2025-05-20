import type { NextApiRequest, NextApiResponse } from 'next';
import getStripeInstance from '../../stripe/createClient';

/**
 * @description mark subscription for cancelation at the end of current period
 */

export default async function cancelSubscription(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  const { subscriptionId, cancelationReason } = req.body as {
    subscriptionId: string;
    cancelationReason: string;
  };

  try {
    const response = await stripe.subscriptions.cancel(subscriptionId, {
      cancellation_details: {
        comment: cancelationReason,
      },
    });

    return res.status(200).json(response);
  } catch (err: any) {
    console.error(
      'cancel-sub-err',
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
