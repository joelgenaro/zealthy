import { Database } from '@/lib/database.types';
import {
  CheckoutFailedResponse,
  CheckoutRequestData,
  CheckoutSuccessResponse,
} from '@/types/api/checkout';
import { StripeError } from '@stripe/stripe-js';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';
import getStripeInstance from '../../stripe/createClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckoutSuccessResponse | CheckoutFailedResponse>
) {
  const stripe = getStripeInstance();

  try {
    const { patient, amount, metadata, description } =
      req.body as CheckoutRequestData;

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
      .eq('patient_id', patient.id)
      .single()
      .then(({ data }) => data?.customer_id);

    // create customer if does not exist
    if (!customer_id) {
      const customer = await stripe.customers.create({
        email: patient.email,
        name: patient.fullName,
        metadata: { zealthy_patient_id: patient.id },
      });

      customer_id = customer.id;

      //create customer in supabase(do not wait for webhook)
      await supabase
        .from('payment_profile')
        .insert({
          customer_id: customer.id,
          patient_id: patient.id,
          processor: 'Stripe',
        })
        .eq('patient_id', patient.id);
    }

    if (amount > 0) {
      const invoice = await stripe.invoices.create({
        customer: customer_id,
        auto_advance: amount !== 39, //disable retries on failed weight loss discounted signup membership charge
        collection_method: 'charge_automatically', //ensures invoice will attempt to charge when finalized
        description: description ? description : 'Zealthy Checkout Payment',
        metadata: {
          client_facing: 'true',
          origin_url: process.env.VERCEL_URL!,
          ...(metadata || {}),
        },
      });

      await stripe.invoiceItems.create({
        customer: customer_id,
        amount: Math.round(amount * 100),
        currency: 'usd',
        invoice: invoice?.id,
      });

      const finalizedInvoice = await stripe.invoices.finalizeInvoice(
        invoice?.id
      );

      const paymentIntent = await stripe.paymentIntents.update(
        finalizedInvoice?.payment_intent as string,
        {
          setup_future_usage: 'off_session',
        }
      );

      res.status(200).json({
        error: null,
        client_secret: paymentIntent.client_secret!,
        status: paymentIntent.status!,
        type: 'payment_intent',
      });
      return;
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customer_id,
      automatic_payment_methods: { enabled: true },
      usage: 'off_session',
      metadata: {
        client_facing: 'true',
        origin_url: process.env.VERCEL_URL!,
        ...(metadata || {}),
      },
    });

    res.status(200).json({
      error: null,
      client_secret: setupIntent.client_secret!,
      status: setupIntent.status!,
      type: 'setup_intent',
    });
  } catch (err) {
    console.error('payment_checkout_err', err);
    res.status(400).json({
      message: (err as StripeError).message || 'Failed',
      error: err,
    });
  }
}
