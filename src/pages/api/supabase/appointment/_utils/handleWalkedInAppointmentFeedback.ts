import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { rateSyncVisitEvent } from '@/utils/freshpaint/events';

type Appointment = Database['public']['Tables']['appointment']['Row'];
type Rating = {
  rating: number;
  review: string;
  status: string;
} | null;

type Patient = {
  profile: {
    email: string | null;
    id: string;
  };
} | null;

export const handleWalkedInAppointmentFeedback = async (
  appointment: Appointment
) => {
  const feedback = appointment.feedback as Rating;
  if (feedback && feedback.rating) {
    const patient = await supabaseAdmin
      .from('patient')
      .select('profile:profiles(email, id)')
      .eq('id', appointment.patient_id)
      .throwOnError()
      .then(({ data }) => data as Patient);

    if (!patient || !patient.profile.email) {
      throw new Error(
        `Could not find patient for id: ${appointment.patient_id}`
      );
    }

    rateSyncVisitEvent(
      patient.profile.id,
      patient.profile.email,
      feedback.rating
    );
  }

  return;
};
