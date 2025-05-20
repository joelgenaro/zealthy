import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

import { handleCommunicationForScheduledVisit } from './handleCommunicationForScheduledVisit';

type Appointment = Database['public']['Tables']['appointment']['Row'];

type Patient = {
  id: number;
  profiles: {
    id: string;
    email: string;
  };
};

type Clinician = {
  zoom_link: string | null;
  daily_room: string | null;
  profiles: {
    id: string;
    email: string;
    phone_number: string;
  };
};

export const sendCommunications = async (appointment: Appointment) => {
  const [patient, clinician] = await Promise.all([
    supabaseAdmin
      .from('patient')
      .select('profiles(email, id)')
      .eq('id', appointment.patient_id)
      .throwOnError()
      .maybeSingle()
      .then(({ data }) => data as Patient | null),
    supabaseAdmin
      .from('clinician')
      .select('zoom_link, daily_room, profiles(email, phone_number)')
      .eq('id', appointment.clinician_id!)
      .throwOnError()
      .maybeSingle()
      .then(({ data }) => data as Clinician | null),
  ]);

  if (!patient) {
    throw new Error(
      `Could not find patient for patient id: ${appointment.patient_id}`
    );
  }

  if (!clinician) {
    throw new Error(
      `Could not find clinician for clinician id: ${appointment.clinician_id}`
    );
  }

  if (appointment.encounter_type === 'Scheduled') {
    //await handleCommunicationForScheduledVisit(appointment, patient, clinician);
  }

  return;
};
