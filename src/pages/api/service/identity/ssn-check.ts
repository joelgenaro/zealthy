import { Database } from '@/lib/database.types';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';
import { ssnVerification } from './utils/ssnVerification';
import { getServiceSupabase } from '@/utils/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default async function DOBCheckHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(400).json({
      message: 'You are in the wrong place!!!',
    });
  }
  const { patientId, ssn } = req.body;

  try {
    let supabase = createServerSupabaseClient<Database>({ req, res });

    // Check if we have a session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    //temp workaround
    if (!session) {
      const apiKey = req.headers['x-kob-zlt-tkn'];
      if (process.env.KOB_TOKEN !== apiKey) {
        return res.status(401).json({
          message: 'not_authenticated',
          description:
            'The user does not have an active session or is not authenticated',
        });
      }
      supabase = getServiceSupabase();
    }

    const [profile, address] = await Promise.all([
      supabase
        .from('patient')
        .select('*, profiles(*)')
        .eq('id', patientId)
        .maybeSingle()
        .then(({ data }) => data?.profiles as Profile | null),

      supabase
        .from('address')
        .select('*')
        .eq('patient_id', patientId)
        .limit(1)
        .maybeSingle()
        .then(({ data }) => data),
    ]);

    if (!profile || !address) {
      throw new Error(`Patient ${patientId} does not have profile or address`);
    }

    const { data, status } = await ssnVerification(
      ssn,
      patientId,
      profile,
      address
    );

    if (data.result.ssnMatch) {
      //mark patient as vouched_verified and return
      await supabase
        .from('patient')
        .update({
          has_verified_identity: true,
          vouched_verified: true,
        })
        .eq('id', patientId);
    }

    return res.status(status).json(data.result);
  } catch (err: any) {
    console.error(err);
    return res
      .status(422)
      .json(err?.message || 'There was an unexpected error');
  }
}
