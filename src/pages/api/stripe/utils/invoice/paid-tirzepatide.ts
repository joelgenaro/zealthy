import getStripeInstance from '../../createClient';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function getPaidTirzepatide(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  try {
    const { orderId, patientId, order, stripeCustomerId } = req.body;

    const stripeInvoice = await stripe.invoices.list({
      customer: stripeCustomerId,
    });

    console.log('stripeInvoices:', stripeInvoice);

    const matchingInvoice = stripeInvoice?.data?.find(
      inv => Number(inv.metadata?.zealthy_order_id) === orderId
    );

    console.log('Matching:', matchingInvoice);

    return res.status(200).json(matchingInvoice?.amount_paid);
  } catch (err: any) {
    console.error('paid-tirz-err', err);
    return res
      .status(404)
      .json(err?.message || 'There was an unexpected error');
  }
}
