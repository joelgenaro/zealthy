import {
  AppointmentPayload,
  AppointmentState,
} from '../reducers/types/appointment';
import { CoachingState, CoachingType } from '../reducers/types/coaching';
import { InsurancePayload, InsuranceState } from '../reducers/types/insurance';
import { PatientState, PatientStatus } from '../reducers/types/patient';
import { ProfileState } from '../reducers/types/profile';
import { VisitPayload, VisitState } from '../reducers/types/visit';
import { mapPayloadToAppointment } from './mapPayloadToAppointment';
import { mapPayloadToVisit } from './mapPayloadToVisit';
import { PatientSubscriptionProps } from '@/components/hooks/data';
import { Database } from '@/lib/database.types';

type Patient = Database['public']['Tables']['patient']['Row'];

export type PayloadType = {
  patient: Patient | null;
  profile: ProfileState | null;
  insurance_policy: InsurancePayload | null;
  appointment: AppointmentPayload[] | null;
  visit: VisitPayload[] | null;
  coaching: PatientSubscriptionProps[] | null;
};

const mapDataToProfile = (data: PayloadType): ProfileState => {
  if (!data.profile) {
    return {} as ProfileState;
  }
  return {
    birth_date: data.profile.birth_date || '',
    first_name: data.profile.first_name || '',
    last_name: data.profile.last_name || '',
    gender: data.profile.gender || '',
    phone_number: data.profile.phone_number || '',
    email: data.profile.email || '',
  };
};

const mapDataToPatient = (data: PayloadType): PatientState => {
  if (!data.patient) {
    return {} as PatientState;
  }

  let feet = null;
  let inch = null;

  if (data.patient.height) {
    feet = Math.floor(data.patient.height / 12);
    inch = data.patient.height - feet * 12;
  }

  return {
    id: data.patient.id,
    has_completed_onboarding: data.patient.has_completed_onboarding,
    region: data.patient.region,
    status: data.patient.status as PatientStatus,
    text_me_update: data.patient.text_me_update,
    has_verified_identity: data.patient.has_verified_identity,
    canvas_patient_id: data.patient.canvas_patient_id,
    hasZealthySubscription: false,
    height_ft: feet,
    height_in: inch,
    weight: data.patient.weight,
    goal_weight: null,
    heart_rate: null,
    BMI: null,
    timezone: data.patient.timezone,
    vouched_verified: data.patient.vouched_verified,
    compound_skip: data.patient.compound_skip,
    dosespot_patient_id: data.patient.dosespot_patient_id,
    insurance_skip: data.patient.insurance_skip,
    insurance_info_requested: data.patient.insurance_info_requested,
    red_rock_patient_id: data.patient.red_rock_patient_id,
    red_rock_charge_account_id: data.patient.red_rock_charge_account_id,
    red_rock_facility_id: data.patient.red_rock_facility_id,
    compound_disclaimer: data.patient.compound_disclaimer,
    red_rock_store_id: data.patient.red_rock_store_id,
    glp1_ineligible: data.patient.glp1_ineligible,
    persona_inquiry_id: data.patient.persona_inquiry_id,
    has_seen_referral: data.patient.has_seen_referral,
    last_weight_loss_message: data.patient.last_weight_loss_message,
    revive_id: data.patient.revive_id,
    deleted_at: data.patient.deleted_at,
    last_refill_request: data.patient.last_refill_request,
    flash_sale_expires_at: data.patient.flash_sale_expires_at,
    missed_call: false,
    spanish_speaker: false,
    medication_history_consent: false,
    weight_loss_free_month_redeemed:
      data.patient.weight_loss_free_month_redeemed ?? null,
    will_prompt_mobile_rating: data.patient.will_prompt_mobile_rating,
    multi_purchase_rating_prompted: data.patient.multi_purchase_rating_prompted,
  };
};

const mapDataToCoaching = (data: PayloadType): CoachingState[] => {
  console.info({ data });

  if (!data.coaching) {
    return [] as CoachingState[];
  }

  return data.coaching.map(coach => ({
    id: coach.subscription.id,
    planId: coach.subscription.reference_id,
    type:
      coach.subscription.name === 'Mental Health Coaching'
        ? CoachingType.MENTAL_HEALTH
        : CoachingType.WEIGHT_LOSS,
    price: coach.price || coach.subscription.price,
    name: coach.subscription.name,
    recurring: {
      interval: coach.interval || 'month',
      interval_count: coach.interval_count || 1,
    },
  }));
};

const mapDataToInsurance = (data: PayloadType): InsuranceState => {
  const insurance_policy = data.insurance_policy;
  if (insurance_policy) {
    return {
      member_id: insurance_policy.member_id,
      is_dependent: insurance_policy.is_dependent,
      payer: insurance_policy.payer,
      plan_name: insurance_policy.plan_name || '',
      plan_status: insurance_policy.plan_status || '',
      plan_type: insurance_policy.plan_type || '',
      policyholder_first_name: insurance_policy.policyholder_first_name,
      policyholder_last_name: insurance_policy.policyholder_last_name,
      member_obligation: insurance_policy.member_obligation || 0,
      hasInsurance: true,
      out_of_network: insurance_policy.out_of_network || false,
    };
  } else {
    return {} as InsuranceState;
  }
};

const mapDataToAppointment = (data: PayloadType): AppointmentState[] => {
  if (!data.appointment) {
    return [] as AppointmentState[];
  }

  const latestProvider = data.appointment.find(
    a => a.appointment_type === 'Provider'
  );
  const latestMentalHealthCoach = data.appointment.find(
    a => a.appointment_type === 'Coach (Mental Health)'
  );
  const latestWeightLossCoach = data.appointment.find(
    a => a.appointment_type === 'Coach (Weight Loss)'
  );

  return [latestProvider, latestMentalHealthCoach, latestWeightLossCoach]
    .filter(Boolean)
    .map(a => mapPayloadToAppointment(a!));
};

export const mapDataToVisit = (data: PayloadType): VisitState => {
  return mapPayloadToVisit(data.visit);
};

export const mapDataToPayload = (data: PayloadType) => ({
  profile: mapDataToProfile(data),
  patient: mapDataToPatient(data),
  insurance: mapDataToInsurance(data),
  appointment: mapDataToAppointment(data),
  visit: mapDataToVisit(data),
  coaching: mapDataToCoaching(data),
});
