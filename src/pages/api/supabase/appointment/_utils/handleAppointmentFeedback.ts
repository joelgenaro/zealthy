import { Database } from '@/lib/database.types';
import { handleWalkedInAppointmentFeedback } from './handleWalkedInAppointmentFeedback';

type Appointment = Database['public']['Tables']['appointment']['Row'];

export const handleAppointmentFeedback = async (appointment: Appointment) => {
  if (appointment.encounter_type === 'Walked-in') {
    await handleWalkedInAppointmentFeedback(appointment);
  }

  return;
};
