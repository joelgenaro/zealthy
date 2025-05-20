import { supabaseAdmin } from '@/lib/supabaseAdmin';
import addDays from 'date-fns/addDays';
import getUnixTime from 'date-fns/getUnixTime';
import Stripe from 'stripe';
import getStripeInstance from '../../../createClient';

type Order = {
  id: number;
  total_price: number | null;
  prescription: {
    duration_in_days: number | null;
  } | null;
};

type SubscriptionOptions = {
  customer: string;
  price: number;
  interval: number;
  metadata: Stripe.Emptyable<Stripe.MetadataParam> | undefined;
};

const stripe = getStripeInstance();

const createRecurringWeightLossSubscription = async (
  options: SubscriptionOptions
) => {
  await stripe.subscriptions.create({
    customer: options.customer,
    items: [
      {
        price_data: {
          unit_amount: options.price,
          currency: 'usd',
          product:
            process.env.VERCEL_ENV === 'production'
              ? 'prod_NwpuVp8xHH6YNK'
              : 'prod_NsjVtgm1CFPTJq',
          recurring: {
            interval: 'day',
            interval_count: options.interval,
          },
        },
      },
    ],
    trial_end: getUnixTime(addDays(new Date(), options.interval)),
    metadata: options.metadata,
  });

  return;
};

const updateRecurringWeightLossSubscription = async (
  subscriptionId: string,
  options: SubscriptionOptions
) => {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  let trialEnd = getUnixTime(addDays(new Date(), options.interval));

  await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price_data: {
          unit_amount: options.price,
          currency: 'usd',
          product: subscription.items.data[0].price.product,
          recurring: {
            interval: subscription.items.data[0].price?.recurring?.interval,
            interval_count:
              options.interval ||
              subscription.items.data[0]?.price?.recurring?.interval_count,
          },
        } as any,
      },
    ],
    trial_end: trialEnd,
    proration_behavior: 'none',
    metadata: {
      ...subscription.metadata,
      ...options.metadata,
    },
  });
};

export const handleRecurringWeightLossSubscription = async (
  invoice: Stripe.Invoice,
  patientId: number
) => {
  //check if it is a $0 invoice for subscription_create
  if (
    invoice.amount_paid === 0 ||
    invoice.billing_reason === 'subscription_create'
  ) {
    return;
  }

  //check if recurring weight loss subscription invoice
  const recurringSub =
    invoice.lines.data.slice(-1)[0].metadata?.zealthy_product_name ===
      'Recurring Weight Loss Medication' ||
    invoice?.metadata?.zealthy_product_name ===
      'Recurring Weight Loss Medication';

  if (!recurringSub) {
    return;
  }

  //check if we have subscription already
  const subscription = await supabaseAdmin
    .from('patient_prescription')
    .select('id, reference_id')
    .eq('patient_id', patientId)
    .eq('subscription_id', 5)
    .eq('product', 'Recurring Weight Loss Medication')
    .in('status', ['trialing', 'active'])
    .throwOnError()
    .limit(1)
    .maybeSingle()
    .then(({ data }) => data);

  const orderId = Number(
    invoice?.metadata?.zealthy_order_id ||
      invoice.lines.data.slice(-1)[0].metadata.zealthy_order_id
  );
  const requestId = Number(
    invoice.metadata?.zealthy_prescription_request_id ||
      invoice.lines.data.slice(-1)[0].metadata.zealthy_prescription_request_id
  );

  const zealthyCare =
    invoice?.metadata?.zealthy_care ||
    invoice.lines.data.slice(-1)[0].metadata.zealthy_care;

  if (!orderId) {
    throw new Error(`Could not find orderId in invoice: ${invoice.id}`);
  }

  if (!requestId) {
    throw new Error(`Could not find requestId in invoice: ${invoice.id}`);
  }

  const order = await supabaseAdmin
    .from('order')
    .select('group_id')
    .eq('id', orderId)
    .throwOnError()
    .maybeSingle()
    .then(({ data }) => data);

  if (!order?.group_id) {
    throw new Error(`Could not find order for id: ${orderId}`);
  }

  const groupOrders = await supabaseAdmin
    .from('order')
    .select('id, total_price, prescription(duration_in_days)')
    .eq('group_id', order.group_id)
    .order('id', { ascending: true })
    .throwOnError()
    .then(({ data }) => data as Order[]);

  if (!groupOrders.length) {
    throw new Error(`Could not find orders for group_id: ${order.group_id}`);
  }

  const interval = groupOrders
    .map(o => o.prescription?.duration_in_days || 0)
    .reduce((acc, item) => (acc += item), 0);

  const metadata = {
    zealthy_patient_id: patientId,
    zealthy_order_id: orderId,
    zealthy_care: zealthyCare || 'Weight loss',
    zealthy_subscription_id: 5,
    zealthy_product_name: 'Recurring Weight Loss Medication',
    zealthy_prescription_request_id: requestId,
  };

  const price = groupOrders[0].total_price
    ? groupOrders[0].total_price * 100
    : invoice.amount_paid;

  if (!subscription || !subscription.id) {
    //this probably shouldn't hit anymore (early july '24) as we are removing medication subscriptions for new wl patients. so, in theory, only existing subscription invoices will ever get to this point (on renewal)
    await createRecurringWeightLossSubscription({
      metadata,
      price,
      interval,
      customer: invoice.customer as string,
    });
  } else {
    await updateRecurringWeightLossSubscription(subscription.reference_id, {
      metadata,
      price,
      interval,
      customer: invoice.customer as string,
    });
  }

  return;
};
