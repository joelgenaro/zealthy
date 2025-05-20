import { Database } from '@/lib/database.types';
import { CommonAction } from './common';

export enum PatientStatus {
  LEAD = 'LEAD',
  PAYMENT_SUBMITTED = 'PAYMENT_SUBMITTED',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  PROFILE_CREATED = 'PROFILE_CREATED',
}

export enum PatientActionTypes {
  ADD_PATIENT_ID = 'ADD_PATIENT_ID',
  ADD_REGION = 'ADD_REGION',
  ADD_OPTED_IN_FOR_UPDATES = 'ADD_OPTED_IN_FOR_UPDATES',
  ADD_IDENTITY_VERIFIED = 'ADD_IDENTITY_VERIFIED',
  ADD_PATIENT_STATUS = 'ADD_PATIENT_STATUS',
  ADD_HEIGHT_FT = 'ADD_HEIGHT_FT',
  ADD_HEIGHT_IN = 'ADD_HEIGHT_IN',
  ADD_WEIGHT = 'ADD_WEIGHT',
  ADD_GOAL_WEIGHT = 'ADD_GOAL_WEIGHT',
  ADD_HEART_RATE = 'ADD_HEART_RATE',
  ADD_BMI = 'ADD_BMI',
  UPDATE_PATIENT = 'UPDATE_PATIENT',
}

export type PatientAction =
  | CommonAction
  | {
      type: PatientActionTypes.ADD_PATIENT_ID;
      payload: number;
    }
  | {
      type:
        | PatientActionTypes.ADD_HEIGHT_FT
        | PatientActionTypes.ADD_HEIGHT_IN
        | PatientActionTypes.ADD_BMI
        | PatientActionTypes.ADD_WEIGHT
        | PatientActionTypes.ADD_GOAL_WEIGHT
        | PatientActionTypes.ADD_HEART_RATE;
      payload: number | null;
    }
  | {
      type: PatientActionTypes.ADD_REGION;
      payload: string;
    }
  | {
      type:
        | PatientActionTypes.ADD_IDENTITY_VERIFIED
        | PatientActionTypes.ADD_OPTED_IN_FOR_UPDATES;
      payload: boolean;
    }
  | {
      type: PatientActionTypes.ADD_PATIENT_STATUS;
      payload: PatientStatus;
    }
  | {
      type: PatientActionTypes.UPDATE_PATIENT;
      payload: Partial<PatientState>;
    };

export type Patient = Database['public']['Tables']['patient']['Row'];

export type MedicalHistoryType = Omit<
  Database['public']['Tables']['medical_history']['Row'],
  'patient_id' | 'created_at'
>;

export type PatientState = Omit<
  Patient,
  | 'created_at'
  | 'updated_at'
  | 'profile_id'
  | 'user_id'
  | 'insurance_item'
  | 'non_integrated_pharmacy'
  | 'weight_loss_medication_eligible'
  | 'denied_reactivation_at'
  | 'height'
  | 'app_review_last_prompted'
  | 'app_last_logged_in'
  | 'last_reviewed_at'
  | 'reactivation_coupon_sent_at'
  | 'weight_loss_goal'
  | 'dosespot_pa_case_id'
  | 'birth_control_eligible'
  | 'ed_eligible'
  | 'enclomiphene_eligible'
  | 'sleep_eligible'
> & {
  hasZealthySubscription: boolean;
  height_ft: number | null;
  height_in: number | null;
  goal_weight: number | null;
  heart_rate: number | null;
  BMI: number | null;
  insurance_info_requested: boolean | null;
};
