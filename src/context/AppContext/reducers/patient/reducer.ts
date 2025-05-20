import { IAppState } from '../types/appState';
import { CommonActionTypes } from '../types/common';
import {
  PatientAction,
  PatientActionTypes,
  PatientState,
  PatientStatus,
} from '../types/patient';

export const patientInitialState: PatientState = {
  id: NaN,
  region: '',
  text_me_update: true,
  has_verified_identity: false,
  status: PatientStatus.LEAD,
  canvas_patient_id: null,
  has_completed_onboarding: false,
  hasZealthySubscription: false,
  height_ft: null,
  height_in: null,
  weight: null,
  goal_weight: null,
  heart_rate: null,
  BMI: null,
  timezone: null,
  vouched_verified: false,
  compound_skip: false,
  dosespot_patient_id: null,
  insurance_skip: false,
  insurance_info_requested: false,
  red_rock_patient_id: null,
  red_rock_charge_account_id: null,
  red_rock_facility_id: null,
  compound_disclaimer: false,
  red_rock_store_id: null,
  glp1_ineligible: false,
  persona_inquiry_id: null,
  has_seen_referral: false,
  last_weight_loss_message: null,
  revive_id: null,
  deleted_at: null,
  last_refill_request: null,
  flash_sale_expires_at: null,
  missed_call: false,
  medication_history_consent: false,
  spanish_speaker: false,
  weight_loss_free_month_redeemed: null,
  will_prompt_mobile_rating: false,
  multi_purchase_rating_prompted: false,
};

const patientReducer = (
  state: PatientState,
  action: PatientAction
): PatientState => {
  switch (action.type) {
    case CommonActionTypes.INIT:
      return {
        ...state,
        ...(action.payload as IAppState).patient,
      };
    case PatientActionTypes.ADD_PATIENT_ID:
      return {
        ...state,
        id: action.payload,
      };
    case PatientActionTypes.ADD_REGION:
      return {
        ...state,
        region: action.payload,
      };
    case PatientActionTypes.ADD_HEIGHT_FT:
      return {
        ...state,
        height_ft: action.payload,
      };
    case PatientActionTypes.ADD_HEIGHT_IN:
      return {
        ...state,
        height_in: action.payload,
      };
    case PatientActionTypes.ADD_WEIGHT:
      return {
        ...state,
        weight: action.payload,
      };
    case PatientActionTypes.ADD_GOAL_WEIGHT:
      return {
        ...state,
        goal_weight: action.payload,
      };
    case PatientActionTypes.ADD_BMI:
      return {
        ...state,
        BMI: action.payload,
      };
    case PatientActionTypes.ADD_HEART_RATE:
      return {
        ...state,
        heart_rate: action.payload,
      };
    case PatientActionTypes.ADD_IDENTITY_VERIFIED:
      return {
        ...state,
        has_verified_identity: action.payload,
      };
    case PatientActionTypes.ADD_OPTED_IN_FOR_UPDATES:
      return {
        ...state,
        text_me_update: action.payload,
      };
    case PatientActionTypes.ADD_PATIENT_STATUS:
      return {
        ...state,
        status: action.payload,
      };
    case PatientActionTypes.UPDATE_PATIENT:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export default patientReducer;
