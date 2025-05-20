import type { NextApiRequest, NextApiResponse } from 'next';
import { Database } from '@/lib/database.types';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import axios from 'axios';
import { utcToZonedTime } from 'date-fns-tz';
import isWithinInterval from 'date-fns/isWithinInterval';
import { parse } from 'querystring';

export default async function CreatePatientHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const parsedBody = typeof req.body === 'string' ? parse(req.body) : req.body;
  const { From, Body, NumMedia } = parsedBody;
  if (NumMedia === '0' && !Body?.trim()) {
    res.status(400).json({ error: 'No message body or media provided' });
    return;
  }
  try {
    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    const patient = await supabase
      .from('patient')
      .select('*, profiles!inner(*)')
      .eq('profiles.phone_number', From)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => data);

    const currentTime = utcToZonedTime(new Date(), patient?.timezone || '');
    const start = new Date(currentTime);
    start.setHours(9, 0, 0); // 9am

    const end = new Date(currentTime);
    end.setHours(19, 0, 0); // 7pm

    // Check if the zoned time is within the interval
    const withinInterval = isWithinInterval(currentTime, { start, end });

    if (withinInterval) {
      // make this withinInterval later
      const recentMessage = await supabase
        .from('messages-v2')
        .select()
        .eq('recipient', patient?.profile_id!)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
        .then(({ data }) => data);

      const clinician = await supabase
        .from('clinician')
        .select('*, profiles (*)')
        .eq('profile_id', recentMessage?.sender!)
        .single()
        .then(({ data }) => data);

      if (NumMedia > '0') {
        // handle images
        const mediaUrls = [];
        for (let i = 0; i < parseInt(NumMedia, 10); i++) {
          mediaUrls.push(parsedBody[`MediaUrl${i}`]);
        }
        await axios
          .post('https://app.getzealthy.com/api/sms-image', {
            data: {
              images: mediaUrls,
              sender: patient?.profile_id,
              recipient: clinician?.profile_id,
              groupId: recentMessage?.messages_group_id,
              notify: false,
            },
          })
          .then(res => console.log(res))
          .catch(e => console.log(e));
      } else {
        //handle text messages
        await axios
          .post('https://app.getzealthy.com/api/message', {
            data: {
              message: Body.trim(),
              sender: `Patient/${patient?.profile_id}`,
              recipient: `Practitioner/${clinician?.profile_id}`,
              groupId: recentMessage?.messages_group_id,
              notify: false,
            },
          })
          .then(res => console.log(res))
          .catch(e => console.log(e));
      }

      res.status(200).json('Success');
    } else {
      res.status(200).json('Time is outside of allowed window!');
    }
  } catch (error: any) {
    console.log(error, 'error');
    res.status(500).json(error?.message || 'There was an unexpected error');
  }
}
