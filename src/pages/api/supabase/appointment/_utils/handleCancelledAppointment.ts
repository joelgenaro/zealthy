import { Database } from '@/lib/database.types';
import { deleteCalendarEvent } from './deleteCalendarEvent';
import { sendCancelNotifications } from './sendCancelNotifications';
import { handleCancelAssociatedTask } from './handleCancelAssociatedTask';

type Appointment = Database['public']['Tables']['appointment']['Row'];

export const handleCancelledAppointment = async (appointment: Appointment) => {
  await Promise.all([
    deleteCalendarEvent(appointment),
    sendCancelNotifications(appointment),
    handleCancelAssociatedTask(appointment),
  ]);
};
