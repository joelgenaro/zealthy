import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Appointment = Database['public']['Tables']['appointment']['Row'];

const typeToScore: { [key in Appointment['status']]: number } = {
  Completed: 2.5,
  Noshowed: 0.5,
  Arrived: 0,
  Attempted: 0,
  Cancelled: 0,
  'Checked-in': 0,
  Confirmed: 0,
  confirmed: 0,
  Exited: 0,
  ProviderRequested: 0,
  Rejected: 0,
  Requested: 0,
  Roomed: 0,
  Unassigned: 0,
  Unconfirmed: 0,
  'Patient-Noshowed': 0,
  'Provider-Noshowed': 0,
};

export const createClinicalDecision = async (appointment: Appointment) => {
  if (appointment.encounter_type !== 'Walked-in') {
    console.log(
      `Appointment ${appointment.id} is not a Walked-in appointment. Returning...`
    );
    return;
  }

  if (appointment.appointment_type !== 'Provider') {
    console.log(
      `Appointment ${appointment.id} is not a Provider appointment. Returning...`
    );
    return;
  }

  if (!appointment.clinician_id) {
    throw new Error(
      `Could not find clinician id for appointment: ${appointment.id}`
    );
  }

  if (appointment.queue_id) {
    await supabaseAdmin.from('clinician_decision').insert({
      clinician_id: appointment.clinician_id,
      decision_made: 'LIVE_VISIT_NOSHOWED',
      value: typeToScore[appointment.status],
      patient_id: appointment.patient_id,
    });
  }

  return;
};
