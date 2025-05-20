import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import getStripeInstance from '../../createClient';

export const manageInvoiceDisputeClosed = async (dispute: Stripe.Dispute) => {
  const stripe = getStripeInstance();

  try {
    const disputedCharge: Stripe.Charge = await stripe.charges.retrieve(
      dispute.charge as string
    );

    if (dispute.status === 'lost') {
      await supabaseAdmin
        .from('invoice')
        .update({ status: 'dispute_lost' })
        .eq('reference_id', disputedCharge.invoice as string)
        .throwOnError();
    } else if (dispute.status === 'won') {
      await supabaseAdmin
        .from('invoice')
        .update({ status: 'dispute_won' })
        .eq('reference_id', disputedCharge.invoice as string)
        .throwOnError();
    }
  } catch (err: any) {
    console.error('dispute-closed-err', err);
    throw new Error(
      `Error in manageInvoiceDisputeClosed: ${JSON.stringify(
        err?.message || 'There was an unexpected error'
      )}`
    );
  }
};
