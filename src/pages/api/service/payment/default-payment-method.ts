import { Database } from '@/lib/database.types';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import getStripeInstance from '../../stripe/createClient';

export default async function fetchPaymentMethodsHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  if (req.method !== 'GET') return;

  const { patientId } = req.query;
  if (!patientId) return res.status(422);

  try {
    // create supabase client
    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    // check if paymentProfile exist
    let customer_id = await supabase
      .from('payment_profile')
      .select('customer_id')
      .eq('patient_id', patientId)
      .single()
      .then(({ data }) => data?.customer_id);

    if (!customer_id) {
      console.info(`Could not find customer_id for patient: ${patientId}`);
      res.status(200).json({
        paymentMethod: null,
      });
      return;
    }

    const customer = (await stripe.customers.retrieve(customer_id, {
      expand: ['invoice_settings.default_payment_method'],
    })) as Stripe.Response<
      Stripe.Customer & {
        invoice_settings: {
          default_payment_method: Stripe.PaymentMethod;
        };
      }
    >;

    const paymentMethod = customer.invoice_settings.default_payment_method
      ? {
          id: customer.invoice_settings.default_payment_method.id,
          last4: customer.invoice_settings.default_payment_method.card?.last4,
          exp_year:
            customer.invoice_settings.default_payment_method.card?.exp_year,
          exp_month:
            customer.invoice_settings.default_payment_method.card?.exp_month,
          brand: customer.invoice_settings.default_payment_method.card?.brand,
        }
      : null;

    res.status(200).json({
      paymentMethod,
    });
  } catch (err) {
    console.error('default-payment-method-err', err);
    res.status(422).json({
      message: 'We could not find any saved payment methods :(',
    });
  }
}
