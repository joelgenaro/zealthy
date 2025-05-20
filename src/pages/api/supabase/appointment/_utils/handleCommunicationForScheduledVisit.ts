import { Database } from '@/lib/database.types';
import {
  appointmentScheduledEvent,
  appointmentScheduledProviderEvent,
} from '@/utils/freshpaint/events';
import getUnixTime from 'date-fns/getUnixTime';

type Appointment = Database['public']['Tables']['appointment']['Row'];

type Patient = {
  id: number;
  profiles: {
    email: string;
    id: string;
  };
};

type Clinician = {
  zoom_link: string | null;
  daily_room: string | null;
  profiles: {
    email: string;
    phone_number: string;
    id: string;
  };
};

export const handleCommunicationForScheduledVisit = async (
  appointment: Appointment,
  patient: {
    profiles: {
      id: string | null;
      email: string | null;
      phone_number: string | null;
    };
  },
  clinician: {
    zoom_link: string | null;
    profiles: {
      id: string | null;
      email: string | null;
      phone_number: string | null;
    };
  },
  callNum: 1 | 2 | 3 | 4
) => {
  const visit_meeting_link = `${
    process.env.VERCEL_ENV === 'production'
      ? 'https://app.getzealthy.com'
      : 'https://frontend-next-git-development-zealthy.vercel.app'
  }/visit/room/${appointment.daily_room}?appointment=${appointment.id}`;

  appointmentScheduledEvent(
    patient?.profiles?.id!,
    patient?.profiles?.email!,
    patient?.profiles?.phone_number!,
    {
      clinician_id: appointment.clinician_id!,
      patient_id: appointment.patient_id,
      appointment_type: appointment.appointment_type,
      starts_at: getUnixTime(new Date(appointment.starts_at!)),
      ends_at: getUnixTime(new Date(appointment.ends_at!)),
      zoom_link: clinician?.zoom_link,
      daily_room: visit_meeting_link,
    },
    callNum
  );

  appointmentScheduledProviderEvent(
    clinician.profiles.id!,
    clinician.profiles.email!,
    clinician.profiles.phone_number!,
    {
      clinician_id: appointment.clinician_id!,
      patient_id: appointment.patient_id,
      appointment_type: appointment.appointment_type,
      starts_at: getUnixTime(new Date(appointment.starts_at!)),
      ends_at: getUnixTime(new Date(appointment.ends_at!)),
      zoom_link: clinician?.zoom_link,
      daily_room: visit_meeting_link,
    },
    callNum
  );
};
