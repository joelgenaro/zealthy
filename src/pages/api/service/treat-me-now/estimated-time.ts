import { Database } from '@/lib/database.types';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import { STATE_QUERY } from './queries';
import { StateResponse } from './types';
import { availableCliniciansCash } from './_utils/availableCliniciansCash';
import differenceInMinutes from 'date-fns/differenceInMinutes';

const BUFFER = 1;

export type EstimatedTimeResponse = {
  estimated_time: number;
  place_in_queue: number;
};

type Data =
  | {
      message: string;
      description?: string;
    }
  | EstimatedTimeResponse;

/**
 * @description current method does not account for insurance
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method is not supported' });
    return;
  }

  const supabase = createServerSupabaseClient<Database>({ req, res });

  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session)
    return res.status(401).json({
      message: 'not_authenticated',
      description:
        'The user does not have an active session or is not authenticated',
    });

  const { region, patient_id } = req.query;
  if (!region || !patient_id) {
    return res.status(422);
  }

  if (region !== 'FL') {
    return;
  }

  //get how may providers are working ILV
  const { data } = await supabase
    .from('state')
    .select(STATE_QUERY)
    // check if state is active
    .eq('abbreviation', region)
    .eq('active', true)
    // check if state has any licensed clinicians
    .eq('state_clinician.active', true)
    // check if clinicians are accepting treat me now requests
    .eq('state_clinician.clinician.accept_treat_me_now', true)
    .eq('state_clinician.clinician.status', 'ON')
    .single();

  const availableClinicians = availableCliniciansCash(data as StateResponse);

  if (availableClinicians.length === 0) {
    res.status(422).json({
      message: 'There are no providers available to take your request',
    });
    return;
  }

  // request for the patient
  const request = await supabase
    .from('appointment')
    .select('created_at')
    .eq('status', 'Unassigned')
    .eq('appointment_type', 'Provider')
    .eq('encounter_type', 'Walked-in')
    .eq('patient_id', patient_id)
    .then(({ data }) => data?.[0]);

  let query = supabase
    .from('appointment')
    .select('duration')
    .eq('status', 'Unassigned')
    .eq('appointment_type', 'Provider')
    .eq('encounter_type', 'Walked-in')
    .eq('location', region)
    .not('patient_id', 'is', patient_id);

  if (request) {
    query = query.lt('created_at', request.created_at);
  }

  //get how many people are inline in front of you
  const unassignedILVAppointments = await query.then(({ data }) => data || []);

  //calculate total wait time not including sessions that are in progress now
  const totalWaitTime = unassignedILVAppointments.reduce((acc, appt) => {
    acc += appt.duration;
    return acc;
  }, 0);

  //wait time per provider not including sessions that are in progress now
  const timePerProvider = Math.floor(
    totalWaitTime / availableClinicians.length
  );

  //get the latest in progress session
  const latestInProgress = await supabase
    .from('appointment')
    .select('duration, ends_at')
    .eq('status', 'Checked-in')
    .eq('appointment_type', 'Provider')
    .eq('encounter_type', 'Walked-in')
    .eq('location', region)
    .order('updated_at', { ascending: true })
    .limit(1)
    .then(({ data }) => data?.[0]);

  if (!latestInProgress) {
    res.status(200).json({
      estimated_time: timePerProvider + BUFFER,
      place_in_queue: unassignedILVAppointments.length + 1,
    });
    return;
  }

  //calculate how much time left in the latest session
  const minutesLeft = differenceInMinutes(
    new Date(latestInProgress.ends_at!),
    new Date()
  );

  res.status(200).json({
    estimated_time:
      timePerProvider + (minutesLeft < 0 ? 0 : minutesLeft) + BUFFER,
    place_in_queue: unassignedILVAppointments.length + 1,
  });
}
