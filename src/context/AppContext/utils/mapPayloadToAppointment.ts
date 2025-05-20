import {
  AppointmentPayload,
  AppointmentState,
  ProviderType,
} from '../reducers/types/appointment';

export const mapPayloadToAppointment = (
  payload: AppointmentPayload
): AppointmentState => {
  const provider = payload.provider
    ? ({
        id: payload.provider.id,
        first_name: payload.provider.profile.first_name,
        last_name: payload.provider.profile.last_name,
        avatar_url: payload.provider.profile.avatar_url,
        email: payload.provider.profile.email,
        canvas_practitioner_id: payload.provider.canvas_practitioner_id,
        zoom_link: payload.provider.zoom_link,
        daily_room: payload.provider.daily_room,
        specialties: payload.provider.specialties,
      } as ProviderType)
    : null;

  return {
    ...payload,
    provider,
    onsched_appointment_id: payload.onsched_appointment_id,
    last_automated_call: payload.last_automated_call || null,
  };
};
