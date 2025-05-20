import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';
import Stripe from 'stripe';
import getStripeInstance from './createClient';
import { manageCustomerCreate } from './utils/customer/create';
import { manageCustomerUpdate } from './utils/customer/update';
import { upsertProductRecord } from './utils/product/create';
import { manageSubscriptionCreate } from './utils/subscription/create';
import { manageSubscriptionUpdate } from './utils/subscription/update';
import {
  manageInvoicePaymentFailed,
  managePaymentUpdate,
} from './utils/payment/update';
import { managePaymentSuccess } from './utils/payment/success';
import { managePaymentIntentSuccess } from './utils/payment-intent/success';
import { managePaymentMethodAttached } from './utils/payment-method/attached';
import { manageSetupIntentSuccess } from './utils/setup-intent/success';
import { manageSubscriptionDelete } from './utils/subscription/delete';
import { manageSetupFailed } from './utils/setup-intent/failed';
import { createInvoice } from './utils/invoice/create';
import { finalizeInvoice } from './utils/invoice/finalized';
import { payInvoice } from './utils/invoice/paid';
import { updateInvoice } from './utils/invoice/update';
import { voidInvoice } from './utils/invoice/voided';
import { manageRefunds, handleRefundUpdate } from './utils/charge/refunded';
import { manageInvoiceDispute } from './utils/invoice/disputed';
import { manageInvoiceDisputeWon } from './utils/invoice/dispute-won';
import { manageInvoiceDisputeClosed } from './utils/invoice/dispute-closed';

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 *
 * buffer is a helper function that reads a Readable stream and returns a Buffer.
 * @param readable
 * @returns
 */

async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

const relevantEvents = new Set([
  'price.created',
  'price.updated',
  'coupon.created',
  'coupon.updated',
  'customer.created',
  'customer.updated',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'payment_intent.payment_failed',
  'setup_intent.setup_failed',
  'charge.refunded',
  'charge.refund.updated',
  'refund.updated',
  'refund.failed',
  'invoice.created',
  'invoice.finalized',
  'invoice.paid',
  'invoice.updated',
  'invoice.voided',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'payment_intent.succeeded',
  'setup_intent.succeeded',
  'payment_method.attached',
  'charge.dispute.created',
  'charge.dispute.funds_reinstated',
  'charge.dispute.closed',
]);

/**
 *
 * webhookHandler is the main function that handles the Stripe webhook events. It will first take the req and create a buffer from it. Then it will check if the event is relevant and if it is, it will process the event accordingly.
 *
 * All possible events handled include:
 * payment_method.attached: This event is triggered when a payment method is attached to a customer.
 * price.created: This event is triggered when a price is created.
 * price.updated: This event is triggered when a price is updated.
 * customer.updated: This event is triggered when a customer is updated.
 * customer.created: This event is triggered when a customer is created.
 * customer.subscription.created: This event is triggered when a customer subscription is created.
 * customer.subscription.updated: This event is triggered when a customer subscription is updated.
 * customer.subscription.deleted: This event is triggered when a customer subscription is deleted.
 * setup_intent.succeeded: This event is triggered when a setup intent is successful.
 * payment_intent.succeeded: This event is triggered when a payment intent is successful.
 * payment_intent.payment_failed: This event is triggered when a payment intent fails.
 * setup_intent.setup_failed: This event is triggered when a setup intent fails.
 * charge.refunded: This event is triggered when a charge is refunded.
 * charge.refund.updated: This event is triggered when a charge refund is updated.
 * refund.updated: This event is triggered when a refund is updated.
 * refund.failed: This event is triggered when a refund fails.
 * invoice.created: This event is triggered when an invoice is created.
 * invoice.finalized: This event is triggered when an invoice is finalized.
 * invoice.paid: This event is triggered when an invoice is paid.
 * invoice.updated: This event is triggered when an invoice is updated.
 * invoice.voided: This event is triggered when an invoice is voided.
 * invoice.payment_failed: This event is triggered when an invoice payment fails.
 * invoice.payment_succeeded: This event is triggered when an invoice payment is successful.
 * charge.dispute.created: This event is triggered when a charge dispute is created.
 * charge.dispute.funds_reinstated: This event is triggered when a charge dispute is resolved.
 * charge.dispute.closed: This event is triggered when a charge dispute is closed.
 *
 * @param req
 * @param res
 * @returns
 */

const stripe = getStripeInstance();

const webhookHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event: Stripe.Event;

    try {
      if (!sig || !webhookSecret) return;
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err: any) {
      console.error(`❌ Error message: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.info(
      `${new Date().toISOString()} Start processing Stripe Webhook: ${
        event.type
      }: ${event.id}`
    );

    if (relevantEvents.has(event.type)) {
      try {
        switch (event.type) {
          case 'payment_method.attached':
            console.info(`payment_method.attached: ${event.id}`);
            await managePaymentMethodAttached(
              event.data.object as Stripe.PaymentMethod
            );
            break;
          case 'price.created':
          case 'price.updated':
            await upsertProductRecord(event.data.object as Stripe.Price);
            break;
          case 'customer.updated':
            console.info(`customer.updated: ${event.id}`);
            await manageCustomerUpdate(event.data.object as Stripe.Customer);
            break;
          case 'customer.created':
            console.info(`customer.created: ${event.id}`);
            await manageCustomerCreate(event.data.object as Stripe.Customer);
            break;
          case 'customer.subscription.created':
            console.info(`customer.subscription.created: ${event.id}`);
            await manageSubscriptionCreate(
              event.data.object as Stripe.Subscription
            );
            break;
          case 'customer.subscription.updated':
            console.info(`customer.subscription.updated: ${event.id}`);
            await manageSubscriptionUpdate(
              event.data.object as Stripe.Subscription
            );
            break;
          case 'customer.subscription.deleted':
            console.info(`customer.subscription.deleted: ${event.id}`);
            await manageSubscriptionDelete(
              event.data.object as Stripe.Subscription
            );
            break;
          case 'setup_intent.succeeded':
            console.info(`setup_intent.succeeded: ${event.id}`);
            await manageSetupIntentSuccess(
              event.data.object as Stripe.SetupIntent
            );
            break;
          case 'payment_intent.succeeded':
            console.info(`payment_intent.succeeded: ${event.id}`);
            await managePaymentIntentSuccess(
              event.data.object as Stripe.PaymentIntent
            );
            break;
          case 'payment_intent.payment_failed':
            console.info(`payment_intent.payment_failed: ${event.id}`);
            await managePaymentUpdate(
              event.data.object as Stripe.PaymentIntent
            );
            break;
          case 'setup_intent.setup_failed':
            console.info(`setup_intent.setup_failed: ${event.id}`);
            await manageSetupFailed(event.data.object as Stripe.SetupIntent);
            break;
          case 'charge.refunded':
            console.info(`charge.refunded: ${event.id}`);
            await manageRefunds(event.data.object as Stripe.Charge);
            break;
          case 'charge.refund.updated':
            console.info(`charge.refund.updated: ${event.id}`);
            await handleRefundUpdate(event.data.object as Stripe.Refund);
            break;
          case 'refund.updated':
            console.info(`refund.updated: ${event.id}`);
            console.info(
              `REFUND EVENT RECEIVED - PROCESSING: ${JSON.stringify({
                id: event.id,
                type: event.type,
                object_id: (event.data.object as any).id,
                object_status: (event.data.object as Stripe.Refund).status,
              })}`
            );
            await handleRefundUpdate(event.data.object as Stripe.Refund);
            console.info(
              `Completed processing refund.updated event: ${event.id}`
            );
            break;
          case 'refund.failed':
            console.info(`refund.failed: ${event.id}`);
            console.info(
              `REFUND EVENT RECEIVED - PROCESSING: ${JSON.stringify({
                id: event.id,
                type: event.type,
                object_id: (event.data.object as any).id,
                object_status: (event.data.object as Stripe.Refund).status,
              })}`
            );
            await handleRefundUpdate(event.data.object as Stripe.Refund);
            console.info(
              `Completed processing refund.failed event: ${event.id}`
            );
            break;
          case 'invoice.created':
            console.info(`invoice.created: ${event.id}`);
            await createInvoice(event.data.object as Stripe.Invoice);
            break;
          case 'invoice.finalized':
            console.info(`invoice.finalized: ${event.id}`);
            await finalizeInvoice(event.data.object as Stripe.Invoice);
            break;
          case 'invoice.paid':
            console.info(`invoice.paid: ${event.id}`);
            await payInvoice(event.data.object as Stripe.Invoice);
            break;
          case 'invoice.updated':
            console.info(`invoice.updated: ${event.id}`);
            await updateInvoice(event.data.object as Stripe.Invoice);
            break;
          case 'invoice.voided':
            console.info(`invoice.voided: ${event.id}`);
            await voidInvoice(event.data.object as Stripe.Invoice);
            break;
          case 'invoice.payment_failed':
            console.info(`invoice.payment_failed: ${event.id}`);
            await manageInvoicePaymentFailed(
              event.data.object as Stripe.Invoice
            );
            break;
          case 'invoice.payment_succeeded':
            console.info(`invoice.payment_succeeded: ${event.id}`);
            await managePaymentSuccess(event.data.object as Stripe.Invoice);
            break;
          case 'charge.dispute.created':
            console.info(`charge.dispute.created: ${event.id}`);
            await manageInvoiceDispute(event.data.object as Stripe.Dispute);
            break;
          case 'charge.dispute.funds_reinstated':
            console.info(`charge.dispute.funds_reinstated: ${event.id}`);
            await manageInvoiceDisputeWon(event.data.object as Stripe.Dispute);
            break;
          case 'charge.dispute.closed':
            console.info(`charge.dispute.closed: ${event.id}`);
            await manageInvoiceDisputeClosed(
              event.data.object as Stripe.Dispute
            );
            break;
          default:
            throw new Error(
              `Unhandled relevant event: id - ${event.id}, type: ${event.type}!`
            );
        }
      } catch (error) {
        console.error(`Error processing Stripe Webhook: ${error}`, {
          error,
        });

        return res
          .status(500)
          .send('Webhook error: "Webhook handler failed. View logs."');
      }
    }

    console.info(
      `${new Date().toISOString()} Finished processing Stripe Webhook: ${
        event.type
      }: ${event.id}`
    );

    return res.status(200).json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
};

export default webhookHandler;
