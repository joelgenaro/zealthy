import getStripeInstance from '../../createClient';
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function issueTirzepatideRefund(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  try {
    const { orderId, stripeCustomerId } = req.body;

    const stripeInvoice = await stripe.invoices.list({
      customer: stripeCustomerId,
    });

    const matchingInvoice = stripeInvoice?.data?.find(
      inv => Number(inv.metadata?.zealthy_order_id) === orderId
    );

    let refund;
    if (matchingInvoice) {
      const chargeId = matchingInvoice.charge || '';
      refund = await stripe.refunds.create({
        charge: chargeId as string,
        amount: matchingInvoice.amount_paid,
      });
    }

    if (refund?.status === 'succeeded') {
      await supabaseAdmin
        .from('order')
        .update({ order_status: 'CANCELED' })
        .eq('id', orderId);

      if (matchingInvoice?.id) {
        await supabaseAdmin
          .from('invoice')
          .update({
            is_refunded: true,
            refunded_at: new Date().toISOString(),
            description: 'Full Refund for tirzepatide medication',
          })
          .eq('reference_id', matchingInvoice?.id);
      }
    } else {
      res.status(400).json({ message: 'Unsuccessfull refund attempt' });
    }

    res.status(200).json({ message: 'Refund issued successfully', refund });
  } catch (err: any) {
    return res
      .status(404)
      .json(err?.message || 'There was an unexpected error');
  }
}
