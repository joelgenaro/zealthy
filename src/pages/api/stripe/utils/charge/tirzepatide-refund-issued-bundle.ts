import getStripeInstance from '../../createClient';
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Stripe from 'stripe';

export default async function issueTirzepatideRefundBundle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  try {
    const {
      orderId,
      stripeCustomerId,
      patientId,
      tirzepatideBundleSubscription,
    } = req.body;

    const stripeSubscription: Stripe.Subscription =
      await stripe.subscriptions.retrieve(
        tirzepatideBundleSubscription.reference_id as string
      );

    let latestPaidInvoice;

    if (stripeSubscription.status === 'trialing') {
      const stripeInvoice = await stripe.invoices.list({
        customer: stripeCustomerId,
      });
      latestPaidInvoice = stripeInvoice?.data?.find(
        inv => Number(inv.amount_paid) === 34900
      );
    } else {
      latestPaidInvoice = await stripe.invoices.retrieve(
        stripeSubscription?.latest_invoice as string
      );
    }

    let refund;
    if (latestPaidInvoice) {
      const chargeId = latestPaidInvoice.charge || '';
      refund = await stripe.refunds.create({
        charge: chargeId as string,
        amount: latestPaidInvoice.amount_paid,
      });
    }

    if (refund?.status === 'succeeded') {
      await stripe.subscriptions.cancel(stripeSubscription.id);

      await supabaseAdmin
        .from('order')
        .update({ order_status: 'CANCELED' })
        .eq('id', orderId);

      await supabaseAdmin
        .from('patient_subscription')
        .update({ status: 'canceled' })
        .eq('reference_id', stripeSubscription?.id);

      if (latestPaidInvoice?.id) {
        await supabaseAdmin
          .from('invoice')
          .update({
            is_refunded: true,
            refunded_at: new Date().toISOString(),
            description: 'Full Refund for tirzepatide bundle membership',
          })
          .eq('reference_id', latestPaidInvoice?.id);
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
