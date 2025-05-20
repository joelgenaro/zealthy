import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Stripe from 'stripe';
import getStripeInstance from '../../createClient';

export const managePaymentMethodAttached = async (
  paymentMethod: Stripe.PaymentMethod
) => {
  const stripe = getStripeInstance();

  try {
    const { customer, card, id } = paymentMethod;

    if (!customer || !card || !id) {
      throw new Error(
        `Missing data: customer: ${customer}, card: ${card}, id: ${id}`
      );
    }

    const { data, error } = await supabaseAdmin
      .from('payment_profile')
      .update({
        last4: card?.last4,
        status: 'active',
      })
      .eq('customer_id', customer)
      .select()
      .throwOnError();

    if (data) {
      // add default payment to customer
      await stripe.customers.update(customer as string, {
        invoice_settings: {
          default_payment_method: id,
        },
      });

      console.log('attached new payment method', {
        message: 'Successful attached new payment method',
        data,
      });
      return { message: 'Ok' };
    }
  } catch (e: any) {
    console.error(e);
    throw new Error(
      `Error in attached.ts: ${JSON.stringify(
        e?.message || 'There was an unexpected error'
      )}`
    );
  }
};
