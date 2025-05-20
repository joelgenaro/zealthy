import { Database } from '@/lib/database.types';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method is not supported' });
    return;
  }

  try {
    let supabase = createServerSupabaseClient<Database>({ req, res });

    // Check if we have a session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    let profileId;
    if (!session) {
      const apiKey = req.headers['x-kob-zlt-tkn'];
      profileId = req.headers['x-tap-uid-fdi'];
      if (process.env.KOB_TOKEN !== apiKey || !profileId) {
        return res.status(401).json({
          message: 'not_authenticated',
          description:
            'The user does not have an active session or is not authenticated',
        });
      }
      supabase = getServiceSupabase();
    }

    if (!session?.user?.id && !profileId) {
      throw new Error('Unable to identify requester');
    }

    const patient = await supabase
      .from('patient')
      .select('id, region')
      .eq(
        'profile_id',
        session?.user?.id ? session.user.id : profileId ? profileId : ''
      )
      .throwOnError()
      .maybeSingle()
      .then(({ data }) => data);

    if (!patient || !patient.region) {
      throw new Error(
        `Could not find patient for user id: ${
          session ? session.user.id : profileId
        }`
      );
    }

    const currentRequests = await supabase
      .from('appointment')
      .select('*')
      .eq('patient_id', patient.id)
      .eq('encounter_type', 'Walked-in')
      .not('status', 'in', '(Completed,Cancelled,Noshowed)')
      .throwOnError()
      .then(({ data }) => data || []);

    if (currentRequests.filter(r => r.status === 'Unassigned').length > 1) {
      throw new Error(`Looks like patient has multiple ongoing ILV visits`);
    }

    if (currentRequests.filter(r => r.status === 'Confirmed').length === 1) {
      const request = currentRequests.find(r => r.status === 'Confirmed');
      res.status(200).json(request);
      return;
    }

    if (currentRequests.filter(r => r.status === 'Unassigned').length === 1) {
      const request = currentRequests.find(r => r.status === 'Unassigned');
      res.status(200).json(request);
      return;
    }

    const request = await supabase
      .from('appointment')
      .insert({
        patient_id: patient.id,
        encounter_type: 'Walked-in',
        appointment_type: 'Provider',
        status: 'Unassigned',
        care: 'Weight loss',
        duration: 15,
        visit_type: 'Video',
        location: patient.region || '',
      })
      .select('*')
      .throwOnError()
      .maybeSingle()
      .then(({ data }) => data);

    res.status(200).json(request);
  } catch (err) {
    let message = (err as Error).message;

    console.warn({
      message,
    });

    res.status(422).json({ message });
  }
}
