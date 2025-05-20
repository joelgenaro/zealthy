export const ROOT_QUERY = `
  id,
  status,
  region,
  text_me_update,
  has_completed_onboarding,
  has_verified_identity,
  has_completed_onboarding,
  canvas_patient_id,
  profiles(
    birth_date,
    first_name,
    last_name,
    gender,
    phone_number
  ),
  insurance_policy(
    member_id,
    policyholder_first_name,
    policyholder_last_name,
    is_dependent,
    plan_status,
    plan_name,
    plan_type,
    member_obligation,
    payer(
      name,
      external_payer_id,
      id
    )
  )
`;

export const PROFILE_QUERY = `
  birth_date,
  first_name,
  last_name,
  gender,
  phone_number,
  email  
`;

export const PATIENT_QUERY = `
  id,
  status,
  region,
  text_me_update,
  has_completed_onboarding,
  has_verified_identity,
  has_completed_onboarding,
  canvas_patient_id,
  last_refill_request
`;

export const APPOINTMENT_QUERY = `
  id,
  duration,
  encounter_type,
  canvas_appointment_id,
  feedback,
  provider: clinician(
    id, 
    canvas_practitioner_id, 
    zoom_link,
    daily_room,
    specialties, 
    type,
    profile: profiles(
      first_name, 
      last_name, 
      email, 
      avatar_url,
      onsched_resource_id
    )
  ),
  location,
  payer_name,
  starts_at,
  ends_at,
  status,
  visit_type,
  calendarId,
  appointment_type,
  description,
  daily_room,
  onsched_appointment_id,
  last_automated_call
`;

export const VISIT_QUERY = `
  id,
  isSync: synchronous,
  careSelected: reason_for_visit(id, reason),
  intakes
`;
