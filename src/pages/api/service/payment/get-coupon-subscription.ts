import type { NextApiRequest, NextApiResponse } from 'next';
import getStripeInstance from '../../stripe/createClient';

/**
 * @description fetch coupon details for a subscription
 */
export default async function getCouponSubscription(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  try {
    const { subscriptionId } = req.body;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const coupon = subscription.discount?.coupon;

    if (coupon) {
      res.status(200).json(coupon);
    } else {
      res.status(404).json({
        message: 'No coupon found for this subscription',
      });
    }
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: 'Error fetching coupon', error: err.message });
  }
}
