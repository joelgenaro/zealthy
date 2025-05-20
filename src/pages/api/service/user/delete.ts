import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import getStripeInstance from '../../stripe/createClient';

const handlerDeleteUser = async (req: NextApiRequest, res: NextApiResponse) => {
  const stripe = getStripeInstance();

  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method is not supported' });
    return;
  }

  try {
    const supabase = getServiceSupabase();

    // Extract email, password, and profileId from the request body
    const { email, password, profileId, patientId } = req.body;

    if (!email || !password || !profileId || !patientId) {
      res.status(400).json({
        message: 'Email, password, and profile ID are required',
      });
      return;
    }

    // Attempt to sign in with the provided email and password for verification
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      res.status(401).json({ message: 'Invalid password' });
      return;
    }

    // If the password is correct, proceed to delete the user
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(
      profileId,
      true
    );

    const subscriptions = await supabase
      .from('patient_subscription')
      .select('reference_id')
      .eq('patient_id', patientId)
      .eq('status', 'active')
      .then(({ data }) => data ?? []);

    const prescriptions = await supabase
      .from('patient_prescription')
      .select('reference_id')
      .eq('patient_id', patientId)
      .eq('status', 'active')
      .then(({ data }) => data ?? []);

    const activeReferenceIds: string[] = [
      ...subscriptions.map(sub => sub.reference_id),
      ...prescriptions.map(pres => pres.reference_id),
    ];

    await Promise.all(
      activeReferenceIds.map(async referenceId => {
        await stripe.subscriptions.del(referenceId);
      })
    );

    res.status(200).json({
      message: 'User successfully deleted',
      user: data.user,
    });
  } catch (err: any) {
    console.error(err);
    res.status(422).json({
      error: err?.message || 'There was an unexpected error',
    });
  }
};

export default handlerDeleteUser;
