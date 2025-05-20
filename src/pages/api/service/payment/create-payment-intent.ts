import { Database } from '@/lib/database.types';
import { CreatePaymentIntentRequest } from '@/types/api/create-payment-intent';
import { StripeError } from '@stripe/stripe-js';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';
import getStripeInstance from '../../stripe/createClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  function getClientIp(req: NextApiRequest) {
    return (
      req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.socket.remoteAddress ||
      '0.0.0.0'
    );
  }

  try {
    const {
      patientId,
      amount,
      metadata,
      userAgent = '',
      isOneTimePayment = true,
    } = req.body as CreatePaymentIntentRequest;

    // create supabase client
    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    const isKlarnaPayment = req.body.isKlarnaPayment ?? false;

    const { data: patient } = await supabase
      .from('patient')
      .select(`*, profiles (*)`)
      .eq('id', patientId)
      .maybeSingle();

    let customer_id = await supabase
      .from('payment_profile')
      .select('customer_id')
      .eq('patient_id', patientId)
      .single()
      .then(({ data }) => data?.customer_id);

    if (!customer_id) {
      const customer = await stripe.customers.create({
        email: patient?.profiles?.email!,
        name:
          patient?.profiles?.first_name! + ' ' + patient?.profiles?.last_name!,
        metadata: { zealthy_patient_id: patientId },
      });

      customer_id = customer.id;

      await supabase
        .from('payment_profile')
        .insert({
          customer_id: customer.id,
          patient_id: patientId,
          processor: 'Stripe',
        })
        .eq('patient_id', patientId);
    }

    if (!customer_id) {
      const customer = await stripe.customers.create({
        email: patient?.profiles?.email!,
        name:
          patient?.profiles?.first_name! + ' ' + patient?.profiles?.last_name!,
        metadata: { zealthy_patient_id: patientId },
      });

      customer_id = customer.id;

      await supabase
        .from('payment_profile')
        .insert({
          customer_id: customer.id,
          patient_id: patientId,
          processor: 'Stripe',
        })
        .eq('patient_id', patientId);
    }

    if (!customer_id) {
      const message = `Could not find stripe "customer_id" for patient: ${patientId}`;
      console.log(message);
      throw new Error(message);
    }

    const ip_address = getClientIp(req);
    const returnUrl = `https://app.getzealthy.com`;

    const paymentIntent = await stripe.paymentIntents.create({
      customer: customer_id,
      amount,
      currency: 'usd',
      description: String(metadata?.zealthy_product_name) ?? undefined,
      metadata: {
        client_facing: 'true',
        origin_url: process.env.VERCEL_URL,
        ...(metadata || {}),
      },
      payment_method_types: ['card', 'klarna'],
      ...(isKlarnaPayment && {
        capture_method: isOneTimePayment ? 'automatic' : 'manual',
        payment_method_data: {
          type: 'klarna',
          billing_details: {
            name:
              patient?.profiles?.first_name +
              ' ' +
              patient?.profiles?.last_name,
            email: patient?.profiles?.email,
            address: { country: 'US' },
          },
        },
        mandate_data: {
          customer_acceptance: {
            type: 'online',
            online: {
              ip_address,
              user_agent: userAgent,
            },
          },
        },
        confirm: isKlarnaPayment,
        return_url: 'https://app.getzealthy.com',
      }),
    });

    res.status(200).json({
      error: null,
      client_secret: paymentIntent.client_secret!,
      status: paymentIntent.status!,
      type: 'payment_intent',
      mandate_data_ip: ip_address,
      intent_id: paymentIntent.id,
    });
  } catch (err) {
    console.error('create-payment-intent-err', err);
    res.status(400).json({
      message: (err as StripeError).message || 'Failed',
      error: err,
    });
  }
}
