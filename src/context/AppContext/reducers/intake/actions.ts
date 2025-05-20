import { Dispatch } from 'react';
import {
  IntakeAction,
  IntakeActionTypes,
  SpecificCareOption,
  PotentialInsuranceOption,
  DefaultAccomplishOptions,
  PrimaryCareOptions,
  VirtualUrgentCareOptions,
  WeightLossOptions,
  MentalHealthOptions,
  HairLossOptions,
  AsyncMentalHealthOptions,
  EnclomipheneOptions,
  PreWorkoutOptions,
} from '../types/intake';

export const getIntakeActions = (dispatch: Dispatch<IntakeAction>) => ({
  addAllergies: (payload: string) =>
    dispatch({
      type: IntakeActionTypes.ADD_ALLERGIES,
      payload,
    }),
  addConditions: (payload: string) =>
    dispatch({
      type: IntakeActionTypes.ADD_CONDITIONS,
      payload,
    }),
  addMedications: (payload: { [medication_name: string]: string }) =>
    dispatch({
      type: IntakeActionTypes.ADD_MEDICATIONS,
      payload,
    }),
  removeMedications: (payload: { [medication_name: string]: boolean }) =>
    dispatch({
      type: IntakeActionTypes.REMOVE_MEDICATIONS,
      payload,
    }),
  addSpecificCare: (payload: SpecificCareOption | null) =>
    dispatch({
      type: IntakeActionTypes.ADD_SPECIFIC_CARE,
      payload,
    }),
  removeSpecificCare: () =>
    dispatch({
      type: IntakeActionTypes.REMOVE_SPECIFIC_CARE,
    }),
  addPotentialInsurance: (payload: PotentialInsuranceOption | null) =>
    dispatch({
      type: IntakeActionTypes.ADD_POTENTIAL_INSURANCE,
      payload,
    }),
  addVariant: (payload: string | null) =>
    dispatch({
      type: IntakeActionTypes.ADD_VARIANT,
      payload,
    }),
  addDefaultAccomplish: (payload: DefaultAccomplishOptions) =>
    dispatch({
      type: IntakeActionTypes.ADD_DEFAULT_ACCOMPLISH,
      payload,
    }),
  removeDefaultAccomplish: (payload: DefaultAccomplishOptions) =>
    dispatch({
      type: IntakeActionTypes.REMOVE_DEFAULT_ACCOMPLISH,
      payload,
    }),
  resetDefaultAccomplish: () =>
    dispatch({
      type: IntakeActionTypes.RESET_DEFAULT_ACCOMPLISH,
    }),
  addPrimaryCare: (payload: PrimaryCareOptions) =>
    dispatch({
      type: IntakeActionTypes.ADD_PRIMARY_CARE,
      payload,
    }),
  removePrimaryCare: (payload: PrimaryCareOptions) =>
    dispatch({
      type: IntakeActionTypes.REMOVE_PRIMARY_CARE,
      payload,
    }),
  resetPrimaryCare: () =>
    dispatch({
      type: IntakeActionTypes.RESET_PRIMARY_CARE,
    }),
  addVirtualUrgentCare: (payload: VirtualUrgentCareOptions) =>
    dispatch({
      type: IntakeActionTypes.ADD_VIRTUAL_URGENT_CARE,
      payload,
    }),
  removeVirtualUrgentCare: (payload: VirtualUrgentCareOptions) =>
    dispatch({
      type: IntakeActionTypes.REMOVE_VIRTUAL_URGENT_CARE,
      payload,
    }),
  resetVirtualUrgentCare: () =>
    dispatch({
      type: IntakeActionTypes.RESET_VIRTUAL_URGENT_CARE,
    }),
  addWeightLoss: (payload: WeightLossOptions) =>
    dispatch({
      type: IntakeActionTypes.ADD_WEIGHT_LOSS,
      payload,
    }),
  removeWeightLoss: (payload: WeightLossOptions) =>
    dispatch({
      type: IntakeActionTypes.REMOVE_WEIGHT_LOSS,
      payload,
    }),
  resetWeightLoss: () =>
    dispatch({
      type: IntakeActionTypes.RESET_WEIGHT_LOSS,
    }),
  addMentalHealth: (payload: MentalHealthOptions) =>
    dispatch({
      type: IntakeActionTypes.ADD_MENTAL_HEALTH,
      payload,
    }),
  addAsyncMentalHealth: (payload: AsyncMentalHealthOptions) =>
    dispatch({
      type: IntakeActionTypes.ADD_ASYNC_MENTAL_HEALTH,
      payload,
    }),
  removeMentalHealth: (payload: MentalHealthOptions) =>
    dispatch({
      type: IntakeActionTypes.REMOVE_MENTAL_HEALTH,
      payload,
    }),
  removeAsyncMentalHealth: (payload: AsyncMentalHealthOptions) =>
    dispatch({
      type: IntakeActionTypes.REMOVE_ASYNC_MENTAL_HEALTH,
      payload,
    }),
  resetMentalHealth: () =>
    dispatch({
      type: IntakeActionTypes.RESET_MENTAL_HEALTH,
    }),
  resetAsyncMentalHealth: () =>
    dispatch({
      type: IntakeActionTypes.RESET_ASYNC_MENTAL_HEALTH,
    }),
  addHairLoss: (payload: HairLossOptions) =>
    dispatch({
      type: IntakeActionTypes.ADD_HAIR_LOSS,
      payload,
    }),
  removeHairLoss: (payload: HairLossOptions) =>
    dispatch({
      type: IntakeActionTypes.REMOVE_HAIR_LOSS,
      payload,
    }),
  resetHairLoss: () =>
    dispatch({
      type: IntakeActionTypes.RESET_HAIR_LOSS,
    }),
  addConcerningSymptom: (payload: string) =>
    dispatch({
      type: IntakeActionTypes.ADD_CONCERNING_SYMPTOM,
      payload,
    }),
  removeConcerningSymptom: (payload: string) =>
    dispatch({
      type: IntakeActionTypes.REMOVE_CONCERNING_SYMPTOM,
      payload,
    }),
  resetConcerningSymptoms: () =>
    dispatch({
      type: IntakeActionTypes.RESET_CONCERNING_SYMPTOMS,
    }),
  setIlvEnabled: (payload: boolean) =>
    dispatch({
      type: IntakeActionTypes.SET_ILV_ENABLED,
      payload,
    }),
  addEnclomiphene: (payload: EnclomipheneOptions) =>
    dispatch({
      type: IntakeActionTypes.ADD_ENCLOMIPHENE,
      payload,
    }),
  removeEnclomiphene: (payload: EnclomipheneOptions) =>
    dispatch({
      type: IntakeActionTypes.REMOVE_ENCLOMIPHENE,
      payload,
    }),
  resetEnclomiphene: () =>
    dispatch({
      type: IntakeActionTypes.RESET_ENCLOMIPHENE,
    }),
  addPreWorkout: (payload: PreWorkoutOptions) =>
    dispatch({
      type: IntakeActionTypes.ADD_PRE_WORKOUT,
      payload,
    }),

  removePreWorkout: (payload: PreWorkoutOptions) =>
    dispatch({
      type: IntakeActionTypes.REMOVE_PRE_WORKOUT,
      payload,
    }),

  resetPreWorkout: () =>
    dispatch({
      type: IntakeActionTypes.RESET_PRE_WORKOUT,
    }),
});
