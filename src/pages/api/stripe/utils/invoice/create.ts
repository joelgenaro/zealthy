import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { calculatedSpecificCare } from '@/pages/api/utils/calculate-specific-care';
import {
  getOrderInvoiceDescription,
  getOrderInvoiceProduct,
} from '@/utils/getOrderInvoiceDescription';

import Stripe from 'stripe';
import getStripeInstance from '../../createClient';

export const createInvoice = async (invoice: Stripe.Invoice) => {
  const stripe = getStripeInstance();

  try {
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

    const description =
      invoice.description || invoice.lines?.data?.slice(-1)[0]?.description;

    console.log(`Creating invoice ${invoice.id}`, {
      meta: {
        invoice: invoice.id,
        patient: patientId,
        nextPaymentAttempt,
        description,
        customer_id: invoice.customer,
      },
    });

    if (patientId) {
      const subscription = invoice.subscription as string;
      let derivedDescription = '';
      let zealthyCare = '';
      let productName = '';

      if (description?.includes('Medication')) {
        const prescription = await supabaseAdmin
          .from('patient_prescription')
          .select(
            'id, order(id, refill_count, prescription(id, medication, national_drug_code, dispense_quantity))'
          )
          .eq('reference_id', subscription)
          .single()
          .throwOnError()
          .then(({ data }) => data as any);

        zealthyCare = await calculatedSpecificCare(
          prescription?.order?.prescription?.national_drug_code || ''
        );

        productName = getOrderInvoiceProduct(
          zealthyCare,
          prescription?.order?.prescription?.dispense_quantity || 0
        );

        derivedDescription = getOrderInvoiceDescription(
          zealthyCare,
          prescription?.order?.prescription?.medication || '',
          prescription?.order?.refill_count || 0,
          prescription?.order?.prescription?.dispense_quantity || 0
        );

        const firstLineItem = invoice?.lines?.data?.slice(-1)[0] ?? {};
        if (
          firstLineItem?.description?.includes('Medication Subscription') &&
          firstLineItem?.metadata?.zealthy_product_name ===
            'Recurring Weight Loss Medication' &&
          firstLineItem?.metadata?.zealthy_care === 'Weight loss'
        ) {
          productName = 'Recurring Weight Loss Medication';
          zealthyCare = 'Weight loss';
        }

        // any non 'draft' invoice will be considered 'finalized', regardless if status is open or paid
        //finalized invoices will always have a truthy finalized_at. attempting to update these will throw errors

        if (!invoice?.status_transitions?.finalized_at) {
          await stripe.invoices.update(invoice.id, {
            description: derivedDescription,
            metadata: {
              zealthy_care: zealthyCare,
              zealthy_product_name: productName,
            },
          });
        }
      }

      await supabaseAdmin
        .from('invoice')
        .upsert({
          patient_id: patientId,
          amount_paid: invoice.amount_paid / 100,
          amount_due: invoice.amount_due / 100,
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
          description: derivedDescription || description,
          care: zealthyCare || invoice.metadata?.zealthy_care || null,
          product:
            productName || invoice.metadata?.zealthy_product_name || null,
        })
        .throwOnError();
    } else {
      throw new Error(`Could not find patient for ${invoice.customer}`);
    }
  } catch (err: any) {
    console.error('createInvoiceErr', err);
    throw new Error(
      `Error in createInvoice: ${
        typeof err === 'string'
          ? err
          : JSON.stringify(err?.message || 'There was an unexpected error')
      }`
    );
  }
};
