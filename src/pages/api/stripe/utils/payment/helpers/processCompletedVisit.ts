import { paymentSuccessVisit } from '@/utils/freshpaint/events';
import Stripe from 'stripe';
import getStripeInstance from '../../../createClient';
import { getServiceSupabase } from '@/utils/supabase';

export const processCompletedVisit = async (invoice: Stripe.Invoice) => {
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

    return paymentSuccessVisit(
      profileId,
      email,
      paymentSucceededAt,
      total,
      cardBrand,
      last4
    );
  } else {
    //most likely we would need to use payment intent to get info on appointments that were charged upfront
    // or we can utilize Zealthy Subscription creation
    console.log(`Could not find a charge for invoice: ${invoice.id}`);
  }
};
