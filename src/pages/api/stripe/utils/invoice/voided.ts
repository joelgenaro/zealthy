import { Invoice } from '@/components/hooks/data';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Stripe from 'stripe';
import { inferSubscriptionMetadata } from './_helpers/inferSubscriptionMetadata';

export const voidInvoice = async (invoice: Stripe.Invoice) => {
  try {
    const isSubscriptionInvoice = invoice.billing_reason
      ?.toLowerCase()
      .includes('subscription');

    const isOneOffInvoice = !isSubscriptionInvoice;

    if (!invoice.customer) {
      throw new Error(`Missing invoice customer for invoice ${invoice.id}`);
    }
    const patientId = await supabaseAdmin
      .from('payment_profile')
      .select('patient_id')
      .eq('customer_id', invoice.customer)
      .limit(1)
      .maybeSingle()
      .throwOnError()
      .then(({ data }) => data?.patient_id);

    let nextPaymentAttempt = null;

    if (invoice.next_payment_attempt) {
      nextPaymentAttempt = new Date(
        invoice.next_payment_attempt * 1000
      ).toISOString();
    }

    if (patientId) {
      const firstLineItem = invoice?.lines?.data?.slice(-1)[0] ?? {};
      const description = invoice.description || firstLineItem.description;

      console.log(`Voiding invoice ${invoice.id}`, {
        meta: {
          invoice: invoice.id,
          patient: patientId,
          nextPaymentAttempt,
          description,
          customer_id: invoice.customer,
        },
      });

      const zealthyCare = isOneOffInvoice
        ? invoice.metadata?.zealthy_care
        : inferSubscriptionMetadata(invoice).zealthyCare;

      const zealthyProduct = isOneOffInvoice
        ? invoice?.metadata?.zealthy_product_name
        : inferSubscriptionMetadata(invoice).zealthyProduct;
      //upserting has been resetting our 'care' and 'product' to null because the columns are nullable. only update these columns if the value is not null
      const updateObj: Partial<Invoice> & {
        amount_paid: number;
        attempted_count: number;
        auto_advance: boolean;
        collection_method: string;
        patient_id: number;
        reference_id: string;
        status: string;
      } = {
        patient_id: patientId,
        amount_due: invoice.amount_due / 100,
        amount_paid: invoice.amount_paid / 100,
        attempted_count: invoice.attempt_count,
        reference_id: invoice.id,
        billing_reason: invoice.billing_reason,
        collection_method: invoice.collection_method,
        subscription: invoice.subscription as string | null,
        charge: invoice.charge as string | null,
        next_payment_attempt: nextPaymentAttempt,
        auto_advance: invoice.auto_advance || false,
        status: invoice.status as string,
        created_at: new Date(invoice.created * 1000).toISOString(),
      };

      if (zealthyCare) updateObj.care = zealthyCare;
      if (zealthyProduct) updateObj.product = zealthyProduct;
      if (description) updateObj.description = description;

      return supabaseAdmin.from('invoice').upsert(updateObj);
    } else {
      throw new Error(`Could not find patient for ${invoice.customer}`);
    }
  } catch (err: any) {
    console.error('invoice-voided-err', err);
    throw new Error(
      `Unable to void invoice for customer: ${invoice.customer}: ${
        typeof err === 'string'
          ? err
          : JSON.stringify(err?.message || 'There was an unexpected error')
      }`
    );
  }
};
