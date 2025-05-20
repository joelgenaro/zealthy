import { paymentSuccessMentalHealthCoaching } from '@/utils/freshpaint/events';
import Stripe from 'stripe';
import getStripeInstance from '../../../createClient';
import { getServiceSupabase } from '@/utils/supabase';

export const processMentalHealthCoachingSubscription = async (
  invoice: Stripe.Invoice
) => {
  const stripe = getStripeInstance();
  const supabase = getServiceSupabase();

  if (invoice.charge) {
    const charge = await stripe.charges.retrieve(invoice.charge as string);

    const email = invoice.customer_email;

    const profileId = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()
      .then(({ data }) => data?.id);

    const paymentSucceededAt = new Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(invoice.created * 1000));
    const total = `$${invoice.amount_paid / 100}`;
    const cardBrand = charge.payment_method_details?.card?.brand;
    const last4 = charge.payment_method_details?.card?.last4;

    return paymentSuccessMentalHealthCoaching(
      profileId,
      email,
      paymentSucceededAt,
      total,
      cardBrand,
      last4
    );
  } else {
    // initial payment or card update
    const customer = (await stripe.customers.retrieve(
      invoice.customer as string,
      {
        expand: ['invoice_settings.default_payment_method'],
      }
    )) as Stripe.Response<
      Stripe.Customer & {
        invoice_settings: {
          default_payment_method: Stripe.PaymentMethod;
        };
      }
    >;

    const price = !!invoice?.lines?.data
      ?.slice(-1)[0]
      ?.description?.includes('Trial period')
      ? 49
      : 99;

    const email = invoice.customer_email;

    const profileId = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()
      .then(({ data }) => data?.id);

    const paymentSucceededAt = new Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(invoice.created * 1000));
    const total = `$${price}`;
    const cardBrand =
      customer.invoice_settings.default_payment_method.card?.brand;
    const last4 = customer.invoice_settings.default_payment_method.card?.last4;

    return paymentSuccessMentalHealthCoaching(
      profileId,
      email,
      paymentSucceededAt,
      total,
      cardBrand,
      last4
    );
  }
};
