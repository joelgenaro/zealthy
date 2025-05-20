import Stripe from 'stripe';
import { processCompletedVisit } from './helpers/processCompletedVisit';
import { processMentalHealthCoachingSubscription } from './helpers/processMentalHealthCoachingSubscription';
import { processMissedVisit } from './helpers/processMissedVisit';
import { processPsychiatrySubscription } from './helpers/processPsychiatrySubscription';
import { processZealthyWeightLossSubscription } from './helpers/processZealthyWeightLossSubscription';
import { processCompoundStatusUpdate } from './helpers/processCompoundStatusUpdate';
import { processBundledRefillOrder } from './helpers/processBundledRefillOrder';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { processRefillCheckTask } from './helpers/processRefillCheckTask';
import { processExpeditedPurchase } from './helpers/processExpeditedPurchase';
import { processSleepMedication } from './helpers/processSleepMedication';
import { processMenopauseMedication } from './helpers/processMenopauseMedication';

/**
 * managePaymentSuccess is called when a Stripe payment is successful and will handle next steps based on the payment.
 *
 * If the invoice is for a compound order, it will call processCompoundStatusUpdate.
 * If the invoice is for a Zealthy Weight Loss subscription, it will call processZealthyWeightLossSubscription.
 * If the invoice is for a missed appointment, it will call processMissedVisit.
 * If the invoice is for a psychiatry subscription, it will call processPsychiatrySubscription.
 * If the invoice is for a completed appointment, it will call processCompletedVisit.
 * If the invoice is for a mental health coaching subscription, it will call processMentalHealthCoachingSubscription.
 * If the invoice is for a bundled plan, it will call processRefillCheckTask and processBundledRefillOrder.
 * If the invoice is for an expedited purchase, it will call processExpeditedPurchase.
 *
 *
 * @param invoice
 * @returns
 */

export const managePaymentSuccess = async (invoice: Stripe.Invoice) => {
  const isPrescriptionSubscription =
    !!invoice?.lines?.data
      ?.slice(-1)[0]
      ?.description?.includes('Medication Subscription') ||
    !!(
      invoice?.metadata?.zealthy_product_name ===
      'Recurring Weight Loss Medication'
    ) ||
    !!invoice?.description?.includes('Medication Subscription') ||
    !!(invoice?.metadata?.zealthy_product_id === '5');

  const zealthy_patient_id =
    invoice?.metadata?.zealthy_patient_id ||
    invoice?.lines?.data?.slice(-1)[0]?.metadata?.zealthy_patient_id;

  if (!invoice.customer) {
    throw new Error(
      `Invoice ${invoice.id} missing customer in payment success`
    );
  }
  await supabaseAdmin
    .from('payment_profile')
    .update({
      status: 'active',
    })
    .eq('customer_id', invoice.customer)
    .throwOnError();

  const zealthy_order_id =
    invoice.lines?.data?.slice(-1)[0]?.metadata?.zealthy_order_id;
  // const zealthy_prescription_request_id =
  //   invoice?.metadata?.zealthy_prescription_request_id;
  const isBundlePlan =
    !!invoice.lines?.data?.slice(-1)[0]?.metadata?.zealthy_bundled ||
    invoice.lines?.data
      ?.slice(-1)[0]
      ?.description?.toLowerCase()
      .includes('oral semaglutide');
  const zealthy_compound_order_id = invoice.metadata?.zealthy_order_id;
  const care = invoice.metadata?.zealthy_care;
  console.info(zealthy_order_id, ': ZEALTHY ORDER ID');

  console.log({
    level: 'info',
    message: `Inside invoice.payment_success event handler for invoice: ${invoice.id}`,
    zealthy_order_id: zealthy_compound_order_id,
  });

  const invoiceLineDescription =
    invoice?.lines?.data?.slice(-1)?.[0]?.description ?? '';

  try {
    if (
      invoice.status === 'paid' &&
      isPrescriptionSubscription &&
      invoice.lines.data[0].metadata.zealthy_care === 'Sleep'
    ) {
      await processSleepMedication(invoice, zealthy_patient_id);
      return;
    }

    if (
      invoice.status === 'paid' &&
      isPrescriptionSubscription &&
      invoice.lines.data[0].metadata.zealthy_care === 'Menopause'
    ) {
      await processMenopauseMedication(invoice, zealthy_patient_id);
      return;
    }

    if (
      invoice.status === 'paid' &&
      invoice.description?.includes('Expedited purchase of ')
    ) {
      console.log(`processing expedited purchase for invoice ${invoice.id}`);
      await processExpeditedPurchase(invoice);
      return;
    }
    if (
      invoice.status === 'paid' &&
      !!zealthy_compound_order_id &&
      care !== 'Erectile dysfunction' &&
      care !== 'ED Medication'
    ) {
      console.log(
        `Processing Compound Status Update for patient ${
          zealthy_patient_id ?? invoice.id
        }`
      );
      await processCompoundStatusUpdate(invoice);
      return;
    }
    if (
      (invoice.status === 'paid' &&
        !isBundlePlan &&
        invoiceLineDescription.includes('Zealthy Weight Loss')) ||
      invoiceLineDescription.includes('Zealthy 3-Month Weight Loss')
    ) {
      console.log(
        `Processing Zealthy Weight Loss Subscription for patient ${
          zealthy_patient_id ?? invoice.id
        }`
      );
      await processZealthyWeightLossSubscription(invoice, zealthy_patient_id);
      return;
    }

    if (
      invoice.status === 'paid' &&
      (invoice.description === 'Missed Appointment' ||
        invoice?.lines?.data
          ?.slice(-1)[0]
          ?.description?.includes('Missed Appointment'))
    ) {
      console.log('in_missed');
      await processMissedVisit(invoice);
      return;
    }

    console.info(JSON.stringify({ item: invoice?.lines?.data }));
    if (
      invoice.status === 'paid' &&
      invoice?.lines?.data
        ?.slice(-1)[0]
        ?.description?.includes('Zealthy Personalized Psychiatry')
    ) {
      await processPsychiatrySubscription(invoice, zealthy_patient_id);
      return;
    }

    if (
      invoice.status === 'paid' &&
      (invoice.description === 'Appointment Completed' ||
        invoice?.lines?.data
          ?.slice(-1)[0]
          ?.description?.includes('Appointment Completed'))
    ) {
      console.log('in appt');
      await processCompletedVisit(invoice);
      return;
    }

    if (
      invoice.status === 'paid' &&
      invoice?.lines?.data
        ?.slice(-1)[0]
        ?.description?.includes('Mental Health Coaching')
    ) {
      console.log('in coaching');
      await processMentalHealthCoachingSubscription(invoice);
      return;
    }

    if (
      isBundlePlan &&
      invoice.status === 'paid' &&
      (invoice.billing_reason === 'subscription_update' ||
        invoice.billing_reason === 'subscription_cycle')
    ) {
      console.log('in bundled');
      await processRefillCheckTask(invoice);
      await processBundledRefillOrder(invoice);
      return;
    }
  } catch (err: any) {
    console.error('managePaymentSuccessErr', JSON.stringify(err));
    throw new Error(
      `Error in payment success: ${
        typeof err === 'string'
          ? err
          : JSON.stringify(err?.message || 'There was an unexpected error')
      }`
    );
  }
};
