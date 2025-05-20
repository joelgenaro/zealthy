import { Database } from '@/lib/database.types';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import sub from 'date-fns/sub';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Data } from './types';
import { getServiceSupabase } from '@/utils/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
type Clinician = Pick<
  Database['public']['Tables']['clinician']['Row'],
  'accept_treat_me_now' | 'last_seen_at' | 'type' | 'status'
>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
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
    //temp workaround
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

    const isBundled = await supabase
      .from('patient_subscription')
      .select('patient_id')
      .eq('patient_id', patient.id)
      .in('price', [297, 217, 446, 349, 449, 718, 891, 249])
      .then(({ data }) => !!(data || []).length);

    const day60 = sub(new Date(), {
      days: 60,
    }).toISOString();

    const minutes15Ago = sub(new Date(), {
      minutes: 15,
    }).toISOString();

    const [available, stateProviders, appointments] = await Promise.all([
      supabase
        .from('state_cash_payer')
        .select('accept_treat_me_now')
        .eq('state', patient.region)
        .throwOnError()
        .maybeSingle()
        .then(({ data }) => data?.accept_treat_me_now),

      supabase
        .from('state_clinician')
        .select(
          'clinician!inner(accept_treat_me_now, status, last_seen_at, type, id)'
        )
        .eq('state', patient.region)
        .eq('active', true)
        .eq('clinician.accept_treat_me_now', true)
        .eq('clinician.status', 'ON')
        .gte('clinician.last_seen_at', minutes15Ago)
        .throwOnError()
        .then(({ data }) => data || [])
        .then(data => data.map(s => s.clinician) as Clinician[]),

      supabase
        .from('appointment')
        .select('id, encounter_type, status')
        .eq('patient_id', patient.id)
        .eq('encounter_type', 'Walked-in')
        .gte('created_at', day60)
        .order('created_at', { ascending: false })
        .limit(2)
        .throwOnError()
        .then(({ data }) => data || []),
    ]);

    console.log({
      APPOINTMENTS: appointments,
      stateProviders: stateProviders,
      available,
    });

    if (
      appointments.length > 1 &&
      appointments.every(
        a => a.encounter_type === 'Walked-in' && a.status === 'Noshowed'
      )
    ) {
      res.status(200).json({
        available: false,
        estimatedWaitTime: null,
      });
      return;
    }

    const lastAppointment = appointments[0];

    // if (
    //   lastAppointment &&
    //   lastAppointment.encounter_type === 'Walked-in' &&
    //   lastAppointment.status === 'Completed'
    // ) {
    //   res.status(200).json({
    //     available: false,
    //     estimatedWaitTime: null,
    //   });
    //   return;
    // }

    if (!available || stateProviders.length === 0) {
      res.status(200).json({
        available: false,
        estimatedWaitTime: null,
      });
      return;
    }

    const bundledProviders = stateProviders.filter(c =>
      c.type.includes('Provider (Bundled Trained)')
    );

    if (isBundled && bundledProviders.length === 0) {
      res.status(200).json({
        available: false,
        estimatedWaitTime: null,
      });
      return;
    }

    const queueType = 'Provider';

    const tasks = await supabaseAdmin
      .from('task_queue')
      .select('id, patient!inner(region)')
      .eq('task_type', 'VIDEO_VISIT_WITH_PROVIDER')
      .eq('patient.region', patient.region)
      .eq('queue_type', queueType)
      .neq('patient_id', patient.id)
      .eq('visible', true)
      .is('completed_at', null)
      .throwOnError()
      .then(({ data }) => data || []);

    console.log({ tasks });

    const numberOfProviders = isBundled
      ? bundledProviders.length
      : stateProviders.length;

    const waitTime = Math.floor(
      ((tasks.length >= 1 ? tasks.length : tasks.length + 1) /
        numberOfProviders) *
        15
    );

    console.log(`Wait time for a user: ${patient.id} is ${waitTime}`);

    res.status(200).json({
      available: waitTime < 30,
      estimatedWaitTime: waitTime < 30 ? waitTime : null,
    });
  } catch (err) {
    let message = (err as Error).message;

    console.warn({
      message,
    });

    res.status(200).json({ available: false, estimatedWaitTime: null });
  }
}
