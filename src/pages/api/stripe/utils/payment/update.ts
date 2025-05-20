import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { paymentRejected } from '@/utils/freshpaint/events';
import Stripe from 'stripe';
import getStripeInstance from '../../createClient';
import { createPortalSession } from '../customer/create-portal';

export const managePaymentUpdate = async (payment: Stripe.PaymentIntent) => {
  const stripe = getStripeInstance();

  const { data: paymentUser } = await supabaseAdmin
    .from('payment_profile')
    .select('last4, patient_id')
    .eq('customer_id', payment.customer as string)
    .single()
    .throwOnError();

  try {
    console.log('Calling managePaymentUpdate');
    console.log(payment);

    let portalUrl;
    if (typeof payment.customer === 'string') {
      const createPortalResponse = await createPortalSession(payment.customer);
      if (createPortalResponse.msg === 'success') {
        portalUrl = createPortalResponse.url;
      }
    }

    await paymentRejected(
      payment.metadata?.patient_id,
      payment.metadata?.email,
      payment.last_payment_error?.payment_method?.card?.last4,
      portalUrl
    );

    // Check if its Klarna payment
    const { data: prescription_request } = await supabaseAdmin
      .from('prescription_request')
      .select('id')
      .eq('uncaptured_payment_intent_id', payment.id)
      .maybeSingle();

    const klarnaErrors = [
      'Customer cancelled checkout on Klarna',
      'Customer was declined by Klarna',
      'Klarna checkout was not completed and has expired',
    ];

    const isCancelledKlarnaPayment =
      payment.last_payment_error?.payment_method?.type === 'klarna' &&
      klarnaErrors.includes(payment.last_payment_error.message || '');
    if (prescription_request || isCancelledKlarnaPayment) {
      console.log('Prescription request found, this is a Klarna payment');
      if (isCancelledKlarnaPayment) {
        console.log('CANCELLED KLARNA PAYMENT: ', payment.id);
        console.log(payment?.last_payment_error?.message);
        if (prescription_request) {
          console.log('DELETING PRESCRIPTION REQUEST!');
          const { error } = await supabaseAdmin
            .from('prescription_request')
            .delete()
            .eq('id', prescription_request.id);
          console.log('ERROR!', error);
        }
      }
      return;
    }

    // Check if this payment is for an existing invoice
    if (payment.invoice) {
      console.log(
        'Payment is for an existing invoice, skipping invoice creation'
      );

      const invoice = await stripe.invoices.retrieve(payment.invoice as string);
      const invoicePaymentMethod = await stripe.paymentIntents.retrieve(
        invoice.payment_intent as string
      );

      await supabaseAdmin.from('invoice').upsert(
        {
          reference_id: invoice.id,
          amount_due: invoice.amount_due / 100,
          amount_paid: invoice.amount_paid,
          description:
            invoice.description ||
            payment.description ||
            'Failed Payment Intent Entry',
          charge: invoicePaymentMethod.latest_charge?.toString() || '',
          status: invoice.status || 'open',
          collection_method: invoicePaymentMethod.capture_method,
          billing_reason: 'Staff direct',
          auto_advance: false,
          patient_id: paymentUser!.patient_id,
          attempted_count: invoice.attempt_count,
          from_payment_intent: payment.id,
        },
        { onConflict: 'reference_id' }
      );

      return;
    }

    // For future reference, creating invoice for failed payments

    // console.log('Payment invoice is not present');
    // // Do not create invoice for $39 payment, this is related to the subscriptions and should be handled differently
    // if (payment.amount === 3900) return;
    //
    // console.log('Amount is not 3900');
    // console.log('Amount is', payment.amount);
    //
    // // Check if an invoice already exists for this payment intent
    // const customerId =
    //   typeof payment.customer === 'string'
    //     ? payment.customer
    //     : payment.customer?.id;
    //
    // console.log('Customer ID is', customerId);
    //
    // if (!customerId) {
    //   throw new Error('Customer ID is required');
    // }
    //
    // const existingInvoices = await stripe.invoices.list({
    //   customer: customerId,
    //   limit: 10,
    //   status: 'open',
    // });
    //
    // const existingInvoice = existingInvoices.data.find(
    //   (inv) => inv.metadata?.original_payment_intent_id === payment.id
    // );
    //
    // if (existingInvoice) {
    //   console.log(
    //     'Found existing invoice for this payment, skipping invoice creation'
    //   );
    //   return;
    // }
    //
    // console.log('Cancelling payment');
    //
    // await stripe.paymentIntents.cancel(payment.id, {
    //   cancellation_reason: 'abandoned',
    // });
    //
    // console.log('Payment cancelled');
    //
    // console.log('Creating invoice');
    //
    // const invoice = await stripe.invoices.create({
    //   customer: customerId,
    //   metadata: {
    //     ...(payment.metadata || {}),
    //     generated_from_payment: 'true',
    //     original_payment_intent_id: payment.id,
    //   },
    //   description: payment.description || undefined,
    //   collection_method: 'charge_automatically',
    // });
    //
    // console.log('Invoice created');
    // console.log('Invoice is', invoice);
    //
    // console.log('Creating invoice item');
    //
    // await stripe.invoiceItems.create({
    //   customer: customerId,
    //   amount: payment.amount,
    //   currency: payment.currency,
    //   description: payment.description || undefined,
    //   invoice: invoice.id,
    // });
    //
    // console.log('Invoice item created');
    //
    // console.log('Finalizing invoice');
    //
    // await stripe.invoices.finalizeInvoice(invoice.id);
    //
    // console.log('Invoice finalized');
    //
    // const invoicePaymentMethod = await stripe.paymentIntents.retrieve(
    //   invoice.payment_intent as string
    // );
    //
    // const dbInvoice = await supabaseAdmin.from('invoice').insert({
    //   reference_id: invoice.id,
    //   amount_due: invoice.amount_due / 100,
    //   amount_paid: invoice.amount_paid,
    //   description: invoice.description || 'Failed Payment Intent Entry',
    //   charge: invoicePaymentMethod.latest_charge?.toString() || '',
    //   attempted_count: 0,
    //   status: invoice.status || 'open',
    //   collection_method: invoicePaymentMethod.capture_method,
    //   billing_reason: 'Staff direct',
    //   auto_advance: false,
    //   patient_id: paymentUser!.patient_id,
    //   from_payment_intent: payment.id,
    // });

    // console.log({ invoice, dbInvoice });
  } catch (ex) {
    console.error(ex);
    throw ex;
  }
};

export const manageInvoicePaymentFailed = async (invoice: Stripe.Invoice) => {
  const stripe = getStripeInstance();

  try {
    if (!invoice.payment_intent) return;

    const payment = await stripe.paymentIntents.retrieve(
      invoice.payment_intent as string
    );

    await supabaseAdmin
      .from('invoice')
      .update({ status: 'open' })
      .eq('reference_id', invoice.id);

    // build patient subscription
    const paymentProfile: Database['public']['Tables']['payment_profile']['Update'] =
      {
        status: payment.status,
      };

    let portalUrl;
    const last4 = payment.last_payment_error?.payment_method?.card?.last4;

    if (typeof payment.customer === 'string') {
      const createPortalResponse = await createPortalSession(payment.customer);
      if (createPortalResponse.msg === 'success') {
        portalUrl = createPortalResponse.url;
      }
    }

    if (!payment.customer) {
      throw new Error(`Payment ${payment.id} missing customer`);
    }
    // insert new subscription to DB
    const paymentFailed = await supabaseAdmin
      .from('payment_profile')
      .update(paymentProfile)
      .eq('customer_id', payment?.customer)
      .throwOnError();

    const { data: paymentUser } = await supabaseAdmin
      .from('payment_profile')
      .select('last4, patient_id')
      .eq('customer_id', payment?.customer)
      .single()
      .throwOnError();

    if (!paymentUser?.patient_id) {
      throw new Error(`paymentUser missing for customer ${payment.customer}`);
    }

    const { data: patientInfo } = await supabaseAdmin
      .from('patient')
      .select('profile_id')
      .eq('id', paymentUser.patient_id)
      .single()
      .throwOnError();

    if (patientInfo?.profile_id) {
      const patientEmail = await supabaseAdmin
        .from('profiles')
        .select('email')
        .eq('id', patientInfo.profile_id)
        .single()
        .throwOnError();

      // These amounts should not trigger payment-failed events
      const excludedAmounts = [0, 39, 49, 217, 149, 349];
      const amountDue = invoice.amount_due / 100;

      if (!excludedAmounts.includes(amountDue)) {
        await paymentRejected(
          patientInfo.profile_id,
          patientEmail.data?.email,
          last4 || paymentUser.last4,
          portalUrl
        );
      } else {
        console.log(
          `Skipping payment-failed event for invoice with amount ${amountDue}`
        );
      }

      console.info(JSON.stringify(paymentFailed), 'Payment failed');
      return;
    }
  } catch (err: any) {
    console.error({ err });
    throw new Error(
      `Error in invoice update: ${
        typeof err === 'string'
          ? err
          : JSON.stringify(err?.message || 'There was an unexpected error')
      }`
    );
  }
};
