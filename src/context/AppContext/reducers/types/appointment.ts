import { Database } from '@/lib/database.types';
import { CommonAction } from './common';

export type AppointmentUpdateType =
  Database['public']['Tables']['appointment']['Update'];

export type AppointmentType =
  Database['public']['Tables']['appointment']['Row'];

export type Clinician = Pick<
  Database['public']['Tables']['clinician']['Row'],
  'canvas_practitioner_id' | 'id' | 'specialties' | 'zoom_link' | 'daily_room'
>;

export type ProviderProfile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'avatar_url' | 'first_name' | 'last_name' | 'email' | 'onsched_resource_id'
>;

export type Provider = Clinician & { profile: ProviderProfile };

export type ProviderType = ProviderProfile & Clinician;

export type AppointmentPayload = Omit<
  AppointmentType,
  | 'created_at'
  | 'updated_at'
  | 'patient_id'
  | 'clinician_id'
  | 'feedback'
  | 'paid'
  | 'calendarId'
  | 'eligible'
  | 'care'
  | 'cancelation_reason'
  | 'canceled_at'
  | 'queue_id'
  | 'patient_joined_at'
  | 'provider_joined_at'
  | 'patient_left_at'
  | 'provider_left_at'
> & {
  provider: Provider;
  last_automated_call: string | null;
};

export enum AppointmentActionTypes {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  REMOVE = 'REMOVE',
  CLEAR_APPOINTMENTS = 'CLEAR_APPOINTMENTS',
}

export type AppointmentActions =
  | CommonAction
  | {
      type: AppointmentActionTypes.CREATE;
      payload: AppointmentState;
    }
  | {
      type: AppointmentActionTypes.UPDATE;
      payload: AppointmentUpdateType;
    }
  | {
      type: AppointmentActionTypes.REMOVE;
      payload: AppointmentState['appointment_type'];
    }
  | {
      type: AppointmentActionTypes.CLEAR_APPOINTMENTS;
    };

export type AppointmentState = Omit<
  AppointmentType,
  | 'created_at'
  | 'updated_at'
  | 'patient_id'
  | 'clinician_id'
  | 'feedback'
  | 'paid'
  | 'calendarId'
  | 'eligible'
  | 'care'
  | 'cancelation_reason'
  | 'canceled_at'
  | 'queue_id'
  | 'provider_joined_at'
  | 'patient_joined_at'
  | 'patient_left_at'
  | 'provider_left_at'
  | 'last_automated_call'
> & {
  provider: ProviderType | null;
  onsched_appointment_id: string | null;
  last_automated_call: string | null;
};
