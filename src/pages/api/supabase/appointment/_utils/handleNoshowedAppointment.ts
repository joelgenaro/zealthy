import { Database } from '@/lib/database.types';
import { chargeMissedAppointmentFee } from './chargeMissedAppointmentFee';
import { createClinicalDecision } from './createClinicalDecision';
import { sendMissedAppointmentNotification } from './sendMissedAppointmentNotification';

type Appointment = Database['public']['Tables']['appointment']['Row'];

export const handleNoshowedAppointment = async (appointment: Appointment) => {
  await Promise.all([
    createClinicalDecision(appointment),
    sendMissedAppointmentNotification(appointment),
    chargeMissedAppointmentFee(appointment),
  ]);
};
