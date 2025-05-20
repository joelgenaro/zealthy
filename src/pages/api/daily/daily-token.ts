import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import axios from 'axios';
import { getServiceSupabase } from '@/utils/supabase';

export default async function CreatePatientHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'GET') return;

    const { room_name } = req.query;

    let supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    // Check if we have a session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    let profileId;
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

    const name = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq(
        'id',
        session?.user?.id ? session.user.id : profileId ? profileId : ''
      )
      .maybeSingle()
      .throwOnError()
      .then(({ data }) => data);

    if (!name) {
      throw new Error(
        `Could not find profile for user: ${
          session ? session.user.id : profileId
        }`
      );
    }

    const payload = {
      properties: {
        room_name,
        user_id: session ? session.user.id : profileId,
        user_name: `${name?.first_name} ${name?.last_name}`,
        redirect_on_meeting_exit: '/patient-portal',
      },
    };

    try {
      const { data } = await axios.post(
        'https://api.daily.co/v1/meeting-tokens',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
          },
        }
      );

      res.status(200).json(data.token);
    } catch (e) {
      return res.status(500).json(`failed to create self-signed JWT: ${e}`);
    }
  } catch (error: any) {
    res.status(500).json(error?.message || 'There was an unexpected error');
  }
}
