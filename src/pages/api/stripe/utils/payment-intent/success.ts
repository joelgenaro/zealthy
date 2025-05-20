import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { paymentEvent } from '@/utils/freshpaint/events';
import getStripeInstance from '../../createClient';
import { Database } from '@/lib/database.types';

type PaymentProfile = {
  customer_id: string;
  patient: {
    id: number;
    region: string;
    profiles: {
      id: string;
      email: string;
      phone_number: string;
      first_name: string;
      last_name: string;
      region: string;
    };
  };
};

type Params = {
  value: number;
  product_name?: string;
  care_selection?: string;
  frequency?: string;
  discount_value?: string;
  is_new?: boolean;
  full_price?: number | null;
  origin_url?: string | null;
};

type Order = {
  prescription: Database['public']['Tables']['prescription']['Row'];
};

export const managePaymentIntentSuccess = async (
  paymentIntent: Stripe.PaymentIntent
) => {
  const stripe = getStripeInstance();

  const params: Params = {
    value: paymentIntent.amount_received / 100,
    care_selection: paymentIntent.metadata.zealthy_care || 'Other',
    product_name: 'Zealthy charge',
    frequency: 'one time',
    origin_url: paymentIntent.metadata.origin_url || 'app.getzealthy.com',
  };

  if (paymentIntent.metadata.zealthy_subscription_id) {
    const subscription = await supabaseAdmin
      .from('subscription')
      .select('*')
      .eq('id', Number(paymentIntent.metadata.zealthy_subscription_id))
      .maybeSingle()
      .then(({ data }) => data);

    if (subscription) {
      params.product_name = subscription.name;
      params.full_price = subscription.price;

      const planObject = await stripe.plans.retrieve(
        subscription?.reference_id
      );

      if (planObject) {
        params.frequency = `${planObject.interval_count} ${planObject.interval}`;
        params.is_new = true;
      }
    }
  }

  if (paymentIntent.invoice) {
    const invoice = (await stripe.invoices.retrieve(
      paymentIntent.invoice as string,
      {
        expand: ['subscription'],
      }
    )) as Stripe.Response<
      Stripe.Invoice & {
        subscription: Stripe.Subscription;
      }
    >;

    params.is_new = invoice.billing_reason === 'subscription_create';

    if (invoice.subscription) {
      params.full_price = invoice.subscription.items.data[0].plan.amount;

      if (invoice.subscription.metadata.zealthy_order_id) {
        const order = await supabaseAdmin
          .from('order')
          .select('prescription!inner(*)')
          .eq('id', Number(invoice.subscription.metadata.zealthy_order_id))
          .maybeSingle()
          .then(({ data }) => data as (Order & { invoice_id?: string }) | null);

        if (order && !order?.invoice_id) {
          await supabaseAdmin
            .from('order')
            .update({ invoice_id: invoice.id })
            .eq('id', invoice.subscription.metadata.zealthy_order_id);
        }
        if (order?.prescription) {
          params.care_selection = invoice.subscription.metadata.zealthy_care;
          params.product_name = order.prescription.medication || '';
          params.frequency = `${invoice.subscription.items.data[0].price.recurring?.interval_count} ${invoice.subscription.items.data[0].price.recurring?.interval}`;
        }
      } else if (invoice.subscription.metadata.zealthy_subscription_id) {
        const subscription = await supabaseAdmin
          .from('subscription')
          .select('name')
          .eq(
            'id',
            Number(invoice.subscription.metadata.zealthy_subscription_id)
          )
          .maybeSingle()
          .then(({ data }) => data);

        if (subscription) {
          params.care_selection = invoice.subscription.metadata.zealthy_care;
          params.product_name = subscription.name;
          params.frequency = `${invoice.subscription.items.data[0].price.recurring?.interval_count} ${invoice.subscription.items.data[0].price.recurring?.interval}`;
        }
      }
    } else {
      params.product_name = invoice.description || 'Zealthy charge';
      params.frequency = 'one time';
    }
  }
  //if no invoice, this should be a manually entered charge on stripe. add row to invoice table to denote

  if (!paymentIntent?.customer) {
    return { message: 'Failed -- missing payment intent customer' };
  }
  const data = await supabaseAdmin
    .from('payment_profile')
    .select('*, patient(id, region, profiles(*))')
    .eq('customer_id', paymentIntent.customer)
    .limit(1)
    .single()
    .then(({ data }) => data as PaymentProfile);

  await supabaseAdmin
    .from('payment_profile')
    .update({
      status: 'active',
    })
    .eq('customer_id', paymentIntent?.customer);

  if (data?.patient?.profiles?.email || data?.patient?.profiles?.id) {
    await paymentEvent(
      data?.patient?.profiles?.id,
      data?.patient?.profiles?.email,
      data?.patient?.profiles?.phone_number,
      data?.patient?.profiles?.first_name,
      data?.patient?.profiles?.last_name,
      data?.patient?.region,
      params.value,
      params.care_selection,
      params.product_name,
      params.frequency,
      !!params.is_new,
      params.full_price || null,
      params.origin_url || 'app.getzealthy.com'
    );
    // create row for charges entered manually in stripe.
    if (!paymentIntent.invoice) {
      await supabaseAdmin.from('invoice').insert({
        reference_id: paymentIntent.id,
        amount_due: paymentIntent.amount / 100,
        amount_paid: paymentIntent.amount / 100,
        description: paymentIntent?.description || 'Manual Entry',
        charge:
          typeof paymentIntent?.latest_charge === 'string'
            ? paymentIntent.latest_charge
            : '',
        attempted_count: 0,
        status: 'paid',
        collection_method: paymentIntent?.capture_method,

        billing_reason: 'Staff direct',
        auto_advance: false,
        patient_id: data?.patient?.id!,
      });
    }
    return { message: 'Ok' };
  } else {
    return { message: 'Failed', data };
  }
};
