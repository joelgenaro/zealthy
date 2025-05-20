import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { JWT } from 'google-auth-library';
import credentials from 'google-credentials.json';
import { google } from 'googleapis';

type Appointment = Database['public']['Tables']['appointment']['Row'];

type Person = {
  profiles: {
    email: string | null;
  };
} | null;

type Patient = Person & {
  timezone: string | null;
};

export const createCalendarEvent = async (appointment: Appointment) => {
  if (appointment.encounter_type === 'Walked-in') {
    return;
  }

  const [clinician, patient] = await Promise.all([
    supabaseAdmin
      .from('clinician')
      .select('profiles (email)')
      .eq('id', appointment.clinician_id!)
      .throwOnError()
      .maybeSingle()
      .then(({ data }) => data as Person),

    supabaseAdmin
      .from('patient')
      .select('timezone, profiles(email)')
      .eq('id', appointment.patient_id)
      .throwOnError()
      .maybeSingle()
      .then(({ data }) => data as Patient),
  ]);

  if (!clinician || !clinician.profiles.email) {
    throw new Error(
      `Could not find clinician for id: ${appointment.clinician_id} or they have no email`
    );
  }

  if (!patient || !patient.profiles.email) {
    throw new Error(
      `Could not find patient for id: ${appointment.patient_id} or they have no email`
    );
  }

  const client = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    subject: clinician.profiles.email,
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  });

  const calendar = google.calendar({ version: 'v3' });
  const visit_meeting_link = `${
    process.env.VERCEL_ENV === 'production'
      ? 'https://app.getzealthy.com'
      : 'https://frontend-next-git-development-zealthy.vercel.app'
  }/visit/room/${appointment.daily_room}?appointment=${appointment.id}`;

  const isCoachingSession = appointment.appointment_type !== 'Provider';
  const provider_email = clinician.profiles.email;
  const patient_email = patient.profiles.email;

  const event_description = [
    `Visit meeting link: ${visit_meeting_link}`,
    `Your remote visit is confirmed. A few minutes before your visit time, use the visit link in this invite to join your visit.`,
    `Be sure to arrive a few minutes early and make sure you are in a comfortable, private setting prior to logging in. We look forward to connecting with you.`,
    isCoachingSession
      ? ''
      : `Remember that there is a $25 fee for not showing up to your visit, so please be sure to attend your visit.`,
  ].join('\n\n');

  const event = {
    summary: isCoachingSession
      ? 'Zealthy Coaching Session'
      : 'Remote Visit with Zealthy',
    location: visit_meeting_link,
    description: event_description,
    start: {
      dateTime: appointment.starts_at,
    },
    end: {
      dateTime: appointment.ends_at,
    },

    attendees: [{ email: patient_email }, { email: provider_email }],
  };

  const res = await calendar.events.insert({
    calendarId: 'primary',
    auth: client,
    requestBody: event,
    sendUpdates: 'all',
  });

  await supabaseAdmin
    .from('appointment')
    .update({
      calendarId: res.data.id,
    })
    .eq('id', appointment.id);
};
