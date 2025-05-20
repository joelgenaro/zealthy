export const CLINICIAN_QUERY = `
  id, 
  canvas_practitioner_id,
  zoom_link, 
  daily_room,
  specialties, 
  profile: profiles(
    first_name, 
    last_name, 
    email, 
    avatar_url
  )
`;
