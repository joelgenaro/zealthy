import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { appointmentCanceledEvent } from '@/utils/freshpaint/events';
import getUnixTime from 'date-fns/getUnixTime';

type Person = {
  profiles: {
    email: string | null;
    id: string;
  };
} | null;

type Appointment = Database['public']['Tables']['appointment']['Row'];

export const sendCancelNotifications = async (appointment: Appointment) => {
  const clinician = await supabaseAdmin
    .from('clinician')
    .select('profiles(email, id)')
    .eq('id', appointment.clinician_id!)
    .throwOnError()
    .maybeSingle()
    .then(({ data }) => data as Person);

  if (!clinician || !clinician.profiles.email) {
    throw new Error(
      `Could not find clinician for id: ${appointment.clinician_id}`
    );
  }

  const visit_meeting_link = `${
    process.env.VERCEL_ENV === 'production'
      ? 'https://app.getzealthy.com'
      : 'https://frontend-next-git-development-zealthy.vercel.app'
  }/visit/room/${appointment.daily_room}?appointment=${appointment.id}`;

  appointmentCanceledEvent(clinician.profiles.id, clinician.profiles.email, {
    appointment_type: appointment.appointment_type,
    starts_at: getUnixTime(new Date(appointment.starts_at!)),
    ends_at: getUnixTime(new Date(appointment.ends_at!)),
    patient_id: appointment.patient_id,
    clinician_id: appointment.clinician_id!,
    daily_room: visit_meeting_link,
    zoom_link: undefined,
  });
};
