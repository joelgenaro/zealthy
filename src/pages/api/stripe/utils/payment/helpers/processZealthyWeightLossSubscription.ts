import { paymentSuccessWeightLossSubscription } from '@/utils/freshpaint/events';
import Stripe from 'stripe';
import getStripeInstance from '../../../createClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { handleRefillNonGlp1 } from './handleRefillNonGlp1';
import { handleResetFreeMonthEligibility } from './handleResetFreeMonthEligibility';
import { getServiceSupabase } from '@/utils/supabase';

export const processZealthyWeightLossSubscription = async (
  invoice: Stripe.Invoice,
  zealthy_patient_id: string | undefined
) => {
  const stripe = getStripeInstance();
  const supabase = getServiceSupabase();

  const lineItem = invoice?.lines?.data?.slice(-1)?.[0];
  const price = lineItem?.description?.includes('Trial period')
    ? 39
    : (invoice?.amount_due ?? 0) > 100
    ? invoice.amount_due / 100
    : lineItem.description?.includes('at $339.00 / every 3 months')
    ? 339
    : 135;

  try {
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

      await paymentSuccessWeightLossSubscription(
        profileId,
        email,
        paymentSucceededAt,
        total,
        cardBrand,
        last4
      );
    } else {
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
      const last4 =
        customer.invoice_settings.default_payment_method.card?.last4;

      console.log(
        JSON.stringify({
          profileId,
          email,
          paymentSucceededAt,
          total,
          cardBrand,
          last4,
        })
      );

      await paymentSuccessWeightLossSubscription(
        profileId,
        email,
        paymentSucceededAt,
        total,
        cardBrand,
        last4
      );
    }
    if (price >= 135 && zealthy_patient_id) {
      try {
        // Resetting free month eligibility once user pays for new month
        await handleResetFreeMonthEligibility(
          Number(zealthy_patient_id),
          supabaseAdmin
        );

        await handleRefillNonGlp1(Number(zealthy_patient_id), supabaseAdmin);
      } catch (error) {
        console.error('Failed to process weight loss subscription updates:', {
          error,
          zealthy_patient_id,
          action: 'reset_eligibility_and_refill',
        });

        throw error;
      }
    }
  } catch (err) {
    console.error(err);
  }
};
