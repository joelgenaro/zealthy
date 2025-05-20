import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import getStripeInstance from '../../createClient';

export const manageInvoiceDispute = async (dispute: Stripe.Dispute) => {
  const stripe = getStripeInstance();

  try {
    const disputedCharge: Stripe.Charge = await stripe.charges.retrieve(
      dispute.charge as string
    );
    if (!disputedCharge?.customer) {
      throw new Error(`Missing dispute charge customer`);
    }

    const patientId = await supabaseAdmin
      .from('payment_profile')
      .select('patient_id')
      .eq('customer_id', disputedCharge.customer)
      .limit(1)
      .maybeSingle()
      .throwOnError()
      .then(({ data }) => data?.patient_id);

    if (patientId) {
      await supabaseAdmin
        .from('invoice')
        .update({ status: 'disputed' })
        .eq('reference_id', disputedCharge.invoice as string)
        .throwOnError();

      const currentDate = new Date().toISOString();

      await supabaseAdmin
        .from('order')
        .update({ order_status: 'Cancelled' })
        .eq('patient_id', patientId)
        .gt('created_at', currentDate)

        .throwOnError();
    }
  } catch (err: any) {
    console.error('invoice-disputed-err', err);
    throw new Error(
      `Error in manage invoice dispute: ${
        typeof err === 'string'
          ? err
          : JSON.stringify(err?.message || 'There was an unexpected error')
      }`
    );
  }
};
