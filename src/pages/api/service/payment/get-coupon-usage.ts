import type { NextApiRequest, NextApiResponse } from 'next';
import getStripeInstance from '../../stripe/createClient';

export default async function getCouponUsage(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  try {
    // Extract referenceId and couponId from query parameters
    const { referenceId, couponId } = req.query;

    // Check if both parameters are provided
    if (!referenceId || !couponId) {
      return res
        .status(400)
        .json({ message: 'Missing referenceId or couponId parameter' });
    }

    // First, retrieve the subscription by reference_id
    const subscription = await stripe.subscriptions.retrieve(
      referenceId as string
    );

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    const customerId = subscription.customer as string;

    // Make API calls in parallel to reduce response time
    const [subscriptions, invoices] = await Promise.all([
      stripe.subscriptions.list({
        customer: customerId, // Now using customer ID from subscription
        status: 'all',
        limit: 100,
      }),
      stripe.invoices.list({ customer: customerId, limit: 100 }),
    ]);

    // Check subscriptions for coupon usage
    const couponInSubscriptions = subscriptions.data.some(
      subscription => subscription.discount?.coupon.id === couponId
    );

    // Check invoices for coupon usage
    const couponInInvoices = invoices.data.some(
      invoice => invoice.discount?.coupon.id === couponId
    );

    // Return true if coupon is found in any of the entities
    const found = couponInSubscriptions || couponInInvoices;

    res.status(200).json(found);
  } catch (err: any) {
    res.status(500).json({
      message: 'Error fetching coupon usage',
      error: err.message,
    });
  }
}
