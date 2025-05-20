import { Database } from '@/lib/database.types';
import { createClinicalDecision } from './createClinicalDecision';

type Appointment = Database['public']['Tables']['appointment']['Row'];

export const handleCompletedAppointment = async (appointment: Appointment) => {
  if (!appointment.clinician_id) {
    throw new Error(
      `Could not find clinician id for appointment: ${appointment.id}`
    );
  }

  await Promise.all([createClinicalDecision(appointment)]);

  return;
};
