import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { JWT } from 'google-auth-library';
import credentials from 'google-credentials.json';
import { google } from 'googleapis';

type Appointment = Database['public']['Tables']['appointment']['Row'];

interface Practitioner {
  profiles: {
    email: string;
  };
}

export const deleteCalendarEvent = async (appointment: Appointment) => {
  if (!appointment.calendarId) {
    throw new Error(
      `Could not delete event for appointment: ${appointment.id} because it have not calendarId`
    );
  }

  const clinician = await supabaseAdmin
    .from('clinician')
    .select('profiles (email)')
    .eq('id', appointment.clinician_id!)
    .single()
    .then(({ data }) => data as Practitioner | null);

  if (!clinician || !clinician.profiles.email) {
    throw new Error(
      `Could not find clinician for ${appointment.clinician_id} or clinician has no email`
    );
  }

  const client = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    subject: clinician?.profiles?.email,
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  });

  const calendar = google.calendar({ version: 'v3' });

  const res = await calendar.events.delete({
    calendarId: 'primary',
    eventId: appointment.calendarId,
    sendUpdates: 'all',
    auth: client,
  });
};
