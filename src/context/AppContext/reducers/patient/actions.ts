import { Dispatch } from 'react';
import {
  PatientAction,
  PatientActionTypes,
  PatientState,
  PatientStatus,
} from '../types/patient';

export const getPatientActions = (dispatch: Dispatch<PatientAction>) => ({
  addRegion: (payload: string) =>
    dispatch({
      type: PatientActionTypes.ADD_REGION,
      payload,
    }),
  addHeightFt: (payload: number | null) =>
    dispatch({
      type: PatientActionTypes.ADD_HEIGHT_FT,
      payload,
    }),
  addHeightIn: (payload: number | null) =>
    dispatch({
      type: PatientActionTypes.ADD_HEIGHT_IN,
      payload,
    }),
  addWeight: (payload: number | null) =>
    dispatch({
      type: PatientActionTypes.ADD_WEIGHT,
      payload,
    }),
  addGoalWeight: (payload: number | null) =>
    dispatch({
      type: PatientActionTypes.ADD_GOAL_WEIGHT,
      payload,
    }),
  addHeartRate: (payload: number | null) =>
    dispatch({
      type: PatientActionTypes.ADD_HEART_RATE,
      payload,
    }),
  addBMI: (payload: number | null) =>
    dispatch({
      type: PatientActionTypes.ADD_BMI,
      payload,
    }),
  addPatientId: (payload: number) =>
    dispatch({
      type: PatientActionTypes.ADD_PATIENT_ID,
      payload,
    }),
  addOptedInForUpdates: (payload: boolean) =>
    dispatch({
      type: PatientActionTypes.ADD_OPTED_IN_FOR_UPDATES,
      payload,
    }),
  addIdentityVerified: (payload: boolean) =>
    dispatch({
      type: PatientActionTypes.ADD_IDENTITY_VERIFIED,
      payload,
    }),
  addStatus: (payload: PatientStatus) =>
    dispatch({
      type: PatientActionTypes.ADD_PATIENT_STATUS,
      payload,
    }),
  updatePatient: (payload: Partial<PatientState>) =>
    dispatch({
      type: PatientActionTypes.UPDATE_PATIENT,
      payload,
    }),
});
