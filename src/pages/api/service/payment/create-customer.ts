import { Database } from '@/lib/database.types';
import { Patient } from '@/types/api/checkout';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';
import getStripeInstance from '../../stripe/createClient';

export default async function createCustomerHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  const { patient } = req.body as { patient: Patient };

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
    const customer_id = await supabase
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

      //create customer in supabase(do not wait for webhook)
      await supabase
        .from('payment_profile')
        .insert({
          customer_id: customer.id,
          patient_id: patient.id,
          processor: 'Stripe',
        })
        .eq('patient_id', patient.id);

      res.status(200).json({
        message: `Successfully create stripe customer for patient: ${patient.id}`,
      });

      return;
    }

    res.status(200).json({
      message: `Customer account for patient ${patient.id} is already created.`,
    });
  } catch (err) {
    console.error('create-customer-err', { err });
    res.status(422).json({
      message: `Was not able to create stripe customer for ${patient.id}`,
    });
  }
}
