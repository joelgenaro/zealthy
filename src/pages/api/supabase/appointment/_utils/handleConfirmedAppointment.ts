import { Database } from '@/lib/database.types';
import { sendCommunications } from './sendCommunications';
import { createDailyRoom } from './createDailyRoom';
import { createCalendarEvent } from './createCalendarEvent';

type Appointment = Database['public']['Tables']['appointment']['Row'];

export const handleConfirmedAppointment = async (appointment: Appointment) => {
  let updatedAppointment: Appointment | null = appointment;

  if (!appointment.daily_room) {
    updatedAppointment = await createDailyRoom(appointment);
  }

  if (!updatedAppointment || !updatedAppointment.daily_room) {
    throw new Error(
      `Looks like we could not generate daily like for appointment: ${appointment.id}`
    );
  }

  return Promise.all([
    //sendCommunications(updatedAppointment),
    createCalendarEvent(updatedAppointment),
  ]);
};
