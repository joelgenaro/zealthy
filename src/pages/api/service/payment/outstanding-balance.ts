import { Database } from '@/lib/database.types';
import { StripeError } from '@stripe/stripe-js';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';
import getStripeInstance from '../../stripe/createClient';

export default async function outstandingBalance(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  try {
    const { patientId } = req.query;
    if (!patientId) return res.status(422);

    // create supabase client
    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    const customer_id = await supabase
      .from('payment_profile')
      .select('customer_id')
      .eq('patient_id', patientId)
      .single()
      .then(({ data }) => data?.customer_id);

    if (!customer_id) {
      const message = `Could not find stripe "customer_id" for patient: ${patientId}`;
      console.log(message);
      throw new Error(message);
    }

    const outstandingBalance = await stripe.invoices
      .list({
        customer: customer_id,
        status: 'open',
      })
      .then(({ data }) =>
        data.reduce((acc, invoice) => {
          return acc + invoice.amount_due;
        }, 0)
      );

    console.log(
      `Outstanding balance for patient: ${patientId} is ${outstandingBalance} cents.`
    );

    if (outstandingBalance > 0) {
      const paymentIntent = await stripe.paymentIntents.create({
        customer: customer_id,
        amount: outstandingBalance, //this amount comes directly from stripe
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        setup_future_usage: 'off_session',
        metadata: {
          client_facing: 'true',
          origin_url: process.env.VERCEL_URL!,
        },
      });

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
      },
    });

    res.status(200).json({
      error: null,
      client_secret: setupIntent.client_secret!,
      status: setupIntent.status!,
      type: 'setup_intent',
    });
  } catch (err) {
    console.error('outstandingBalanceErr', err);
    res.status(400).json({
      message: (err as StripeError).message || 'Failed',
      error: err,
    });
  }
}
