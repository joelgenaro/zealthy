import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import getStripeInstance from '../../createClient';

export const manageInvoiceDisputeWon = async (dispute: Stripe.Dispute) => {
  const stripe = getStripeInstance();

  try {
    const disputedCharge: Stripe.Charge = await stripe.charges.retrieve(
      dispute.charge as string
    );

    await supabaseAdmin
      .from('invoice')
      .update({ status: 'dispute_won' })
      .eq('reference_id', disputedCharge.invoice as string)
      .throwOnError();
  } catch (err: any) {
    console.error('dispute-won-err', err);
    throw new Error(
      `Erro in manageInvoiceDisputeWon: ${JSON.stringify(
        err?.message || 'There was an unexpected error'
      )}`
    );
  }
};
