import type { NextApiRequest, NextApiResponse } from 'next';
import { MarkSubscriptionCouponAppliedRequest } from '@/types/api/apply-coupon-subscription';
import getStripeInstance from '../../stripe/createClient';

/**
 * @description mark subscription for cancelation at the end of current period
 */

export default async function scheduleForCancelation(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  const { subscriptionId, couponId } =
    req.body as MarkSubscriptionCouponAppliedRequest;

  try {
    const response = await stripe.subscriptions.update(subscriptionId, {
      coupon: couponId,
    });
    console.info('coupon-sub', JSON.stringify(response), 'response');

    if (response?.id) {
      res.status(200).json('Successfully applied coupon to subscription');
    } else {
      throw new Error(
        `There was an error cancelling your subscription: ${subscriptionId}`
      );
    }
  } catch (err: any) {
    console.error(
      'coupon-sub-err',
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
