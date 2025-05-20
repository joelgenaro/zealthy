import { Database } from '@/lib/database.types';
import { CreateSetupIntentRequest } from '@/types/api/create-setup-intent';
import { StripeError } from '@stripe/stripe-js';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';
import getStripeInstance from '../../stripe/createClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  try {
    const { patientId } = req.body as CreateSetupIntentRequest;

    // create supabase client
    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    const isKlarnaPayment = req.body.isKlarnaPayment ?? false;

    const customer_id = await supabase
      .from('payment_profile')
      .select('customer_id')
      .eq('patient_id', patientId)
      .single()
      .then(({ data }) => data?.customer_id);

    const { data: patient } = await supabase
      .from('patient')
      .select(`*, profiles (*)`)
      .eq('id', patientId)
      .maybeSingle();

    if (!customer_id) {
      const message = `Could not find stripe "customer_id" for patient: ${patientId}`;
      console.log(message);
      throw new Error(message);
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customer_id,
      payment_method_types: ['card', 'klarna'],
      payment_method_data: isKlarnaPayment
        ? {
            type: 'klarna',
            billing_details: {
              name:
                patient?.profiles?.first_name +
                ' ' +
                patient?.profiles?.last_name,
              email: patient?.profiles?.email,
              address: { country: 'US' },
            },
          }
        : undefined,
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
    console.error('create-setup-intent-err', err);
    res.status(400).json({
      message: (err as StripeError).message || 'Failed',
      error: err,
    });
  }
}
