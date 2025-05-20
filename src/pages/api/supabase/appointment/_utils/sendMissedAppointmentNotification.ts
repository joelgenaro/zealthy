import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { appointmentMissedEvent } from '@/utils/freshpaint/events';
import getUnixTime from 'date-fns/getUnixTime';

type Appointment = Database['public']['Tables']['appointment']['Row'];

type Person = {
  profiles: {
    id: string | null;
    email: string | null;
  };
} | null;

export const sendMissedAppointmentNotification = async (
  appointment: Appointment
) => {
  const patient = await supabaseAdmin
    .from('patient')
    .select('profiles(email, id)')
    .eq('id', appointment.patient_id)
    .throwOnError()
    .maybeSingle()
    .then(({ data }) => data as Person);

  if (!patient || !patient.profiles.email) {
    throw new Error(`Could not find patient by id: ${appointment.id}`);
  }

  if (appointment.starts_at && appointment.ends_at) {
    const apptData = {
      appointment_type: appointment?.appointment_type,
      starts_at: getUnixTime(new Date(appointment?.starts_at)),
      ends_at: getUnixTime(new Date(appointment?.ends_at)),
      status: appointment?.status,
    };

    appointmentMissedEvent(
      patient.profiles?.id!,
      patient.profiles?.email,
      apptData
    );
  }

  return;
};
