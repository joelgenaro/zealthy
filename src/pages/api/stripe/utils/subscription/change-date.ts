import getStripeInstance from '../../createClient';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function changeRefillDate(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  try {
    const { referenceId, newDate, isGetNow = false } = req.body;
    // update patient subscription
    await stripe.subscriptions
      .update(referenceId, {
        ...(isGetNow
          ? { billing_cycle_anchor: 'now' }
          : { trial_end: newDate }),
        proration_behavior: 'none',
      })
      .catch(e => console.log(e, 'error'));

    res.status(200).json('Success');
  } catch (err) {
    console.error({ err });
    return res.status(400);
  }
}
