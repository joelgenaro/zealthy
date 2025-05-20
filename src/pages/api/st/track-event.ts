import { Database } from '@/lib/database.types';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';

type EventData = {
  eventName: string;
  stz_obj: {
    stz_user_id: string;
    key: string;
  };
  eventData?: {
    profile_id?: string;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'OPTIONS') {
    console.info('TEAPI: OPTIONS method received, returning 200');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.warn('TEAPI: Invalid method received', { method: req.method });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { eventName, stz_obj, eventData } = req.body as EventData;

    // Validate input early
    if (!isValidEventData(eventName, stz_obj)) {
      console.info('TEAPI: Invalid event data', { eventName, stz_obj });
      return res.status(400).json({ error: 'Invalid input' });
    }

    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    // Process different event types in parallel where possible
    if (eventName === 'AccountCreated') {
      await handleCreateAccountEvent(supabase, stz_obj, eventData);
    } else {
      let pid = eventData?.profile_id;
      if (!pid) {
        pid = await getOrFetchProfileId(supabase, stz_obj.stz_user_id);
      }

      await handleOtherEvents(supabase, eventName, stz_obj, pid);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('TEAPI: Error in track-event API', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      data: {
        reqBody: req.body.toString,
      },
    });
  }
}

// Validates event data
function isValidEventData(
  eventName: string,
  stz_obj: EventData['stz_obj']
): boolean {
  return (
    !!eventName &&
    typeof eventName === 'string' &&
    !!stz_obj.stz_user_id &&
    typeof stz_obj.stz_user_id === 'string' &&
    !!stz_obj.key &&
    typeof stz_obj.key === 'string'
  );
}

// Handle AccountCreated event with improved efficiency
async function handleCreateAccountEvent(
  supabase: any,
  stz_obj: EventData['stz_obj'],
  eventData?: EventData['eventData']
): Promise<void> {
  if (!eventData?.profile_id) {
    console.warn('TEAPI: Missing profile_id in eventData', { stz_obj });
    return;
  }

  try {
    // Run select and update operations in parallel
    const [{ error: selectError }, { error: updateError }] = await Promise.all([
      supabase
        .from('st_zealthy_user_variation')
        .select('id')
        .eq('stz_user_id', stz_obj.stz_user_id)
        .single(),
      supabase
        .from('st_zealthy_user_variation')
        .update({ profile_id: eventData.profile_id })
        .eq('stz_user_id', stz_obj.stz_user_id),
    ]);

    if (selectError && selectError.code !== 'PGRST116')
      throw new Error(
        `Error checking existing user variation: ${selectError.message}`
      );
    if (updateError)
      throw new Error(
        `Error updating profile ID on AccountCreated: ${updateError.message}`
      );

    // Insert user metric in parallel
    await insertUserMetric(
      supabase,
      stz_obj,
      'AccountCreated',
      eventData.profile_id
    );
  } catch (error) {
    console.error('TEAPI: Error processing AccountCreated event', {
      stz_obj,
      error,
    });
  }
}

// Handle other events with improved efficiency
async function handleOtherEvents(
  supabase: any,
  eventName: string,
  stz_obj: EventData['stz_obj'],
  profile_id: string
): Promise<void> {
  const isEventAlreadyLogged = await checkIfEventExists(
    supabase,
    stz_obj,
    eventName,
    profile_id
  );

  if (!isEventAlreadyLogged) {
    await insertUserMetric(supabase, stz_obj, eventName, profile_id);
  }
}

// Insert user metric into the database with optimized checks
async function insertUserMetric(
  supabase: any,
  stz_obj: EventData['stz_obj'],
  eventName: string,
  idToUse: string // This can be either profile_id or stz_user_id
): Promise<void> {
  console.info('TEAPI: Inserting or updating user metric', {
    eventName,
    stz_obj,
    idToUse,
  });

  // Use UPSERT to insert a new metric if it doesn't exist, otherwise update it
  const { error: upsertError } = await supabase
    .from('st_zealthy_user_metric')
    .upsert({
      stz_user_id: stz_obj.stz_user_id,
      profile_id: idToUse,
      campaign_key: stz_obj.key,
      metric_name: eventName,
    })
    .eq('campaign_key', stz_obj.key)
    .eq('profile_id', idToUse)
    .eq('metric_name', eventName);

  if (upsertError) {
    console.error('TEAPI: Error inserting/updating user metric', {
      stz_obj,
      eventName,
      idToUse,
      error: upsertError.message,
    });
    throw new Error(
      `Error inserting/updating user metric: ${upsertError.message}`
    );
  }

  console.info(
    `TEAPI: Metric for event "${eventName}" successfully inserted or updated.`
  );
}
``;

// Fetch or get profile_id with error handling and optimization
async function getOrFetchProfileId(
  supabase: any,
  stz_user_id: string
): Promise<string> {
  const { data, error } = await supabase
    .from('st_zealthy_user_variation')
    .select('profile_id')
    .eq('stz_user_id', stz_user_id)
    .single();

  if (error || !data?.profile_id) {
    throw new Error(
      `Error fetching profile_id: ${error?.message || 'Not found'}`
    );
  }

  return data.profile_id;
}

// Check if an event already exists
async function checkIfEventExists(
  supabase: any,
  stz_obj: EventData['stz_obj'],
  eventName: string,
  idToUse: string
): Promise<boolean> {
  const { data } = await supabase
    .from('st_zealthy_user_metric')
    .select('id')
    .eq('profile_id', idToUse)
    .eq('metric_name', eventName)
    .single();

  return !!data;
}
