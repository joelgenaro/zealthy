import { NextApiRequest, NextApiResponse } from 'next';
import getStripeInstance from '../../stripe/createClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function getSubscriptionHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  let supabase = createServerSupabaseClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  let profileId;
  // temp workaround
  if (!session) {
    const apiKey = req.headers['x-kob-zlt-tkn'];
    profileId = req.headers['x-tap-uid-fdi'];
    if (process.env.KOB_TOKEN !== apiKey) {
      return res.status(401).json({
        message: 'not_authenticated',
        description:
          'The user does not have an active session or is not authenticated',
      });
    }
  }

  try {
    const { subscriptionId } = req.body;

    const { data: patientSubscription, error } = await supabaseAdmin
      .from('patient_subscription')
      .select('patient_id')
      .eq('reference_id', subscriptionId)
      .single();

    if (error || !patientSubscription) {
      console.error('Failed to retrieve patient subscription', { error });
      return res.status(400).json({ message: 'Invalid subscription ID' });
    }

    const { data: patientProfile, error: patientError } = await supabaseAdmin
      .from('patient')
      .select('profile_id')
      .eq('id', patientSubscription.patient_id)
      .single();

    if (patientError || !patientProfile) {
      console.error('Failed to retrieve patient profile', {
        error: patientError,
      });
      return res.status(400).json({ message: 'Invalid patient ID' });
    }

    if (patientProfile.profile_id !== (session ? session.user.id : profileId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscriptionId
    );

    res.status(200).json(stripeSubscription);
  } catch (err: any) {
    console.error('Error retrieving subscription', { error: err.message });
    res.status(500).json({ message: 'Error retrieving subscription' });
  }
}
