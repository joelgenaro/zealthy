import { IAppState } from '../types/appState';
import { CommonActionTypes } from '../types/common';
import { IntakeAction, IntakeActionTypes, IntakeState } from '../types/intake';

export const intakeInitialState: IntakeState = {
  allergies: '',
  conditions: '',
  medications: {},
  specificCare: null,
  potentialInsurance: null,
  variant: null,
  concerningSymptoms: [],
  defaultAccomplish: [],
  primaryCare: [],
  virtualUrgentCare: [],
  weightLoss: [],
  mentalHealth: [],
  asyncMentalHealth: [],
  hairLoss: [],
  ilvEnabled: false,
  enclomiphene: [],
  preWorkout: [],
};

const intakeReducer = (
  state: IntakeState,
  action: IntakeAction
): IntakeState => {
  switch (action.type) {
    case CommonActionTypes.INIT:
      return {
        ...state,
        ...(action.payload as IAppState).intake,
      };
    case CommonActionTypes.RESET:
      return intakeInitialState;
    case IntakeActionTypes.ADD_ALLERGIES:
      return {
        ...state,
        allergies: action.payload,
      };
    case IntakeActionTypes.ADD_CONDITIONS:
      return {
        ...state,
        conditions: action.payload,
      };
    case IntakeActionTypes.ADD_MEDICATIONS:
      return {
        ...state,
        medications: { ...state.medications, ...action.payload },
      };
    case IntakeActionTypes.REMOVE_MEDICATIONS:
      return {
        ...state,
        medications:
          Object.keys(action.payload || {}).length === 0
            ? {}
            : Object.keys(state.medications)
                .filter(key => !action.payload[key])
                .reduce((acc, key) => {
                  acc[key] = state.medications[key];
                  return acc;
                }, {} as { [medication_name: string]: string }),
      };

    case IntakeActionTypes.ADD_SPECIFIC_CARE:
      return {
        ...state,
        specificCare: action.payload,
      };
    case IntakeActionTypes.REMOVE_SPECIFIC_CARE:
      return {
        ...state,
        specificCare: null,
      };
    case IntakeActionTypes.ADD_POTENTIAL_INSURANCE:
      return {
        ...state,
        potentialInsurance: action.payload,
      };
    case IntakeActionTypes.ADD_VARIANT:
      return {
        ...state,
        variant: action.payload,
      };
    case IntakeActionTypes.ADD_DEFAULT_ACCOMPLISH:
      return {
        ...state,
        defaultAccomplish: [...state.defaultAccomplish, action.payload],
      };
    case IntakeActionTypes.REMOVE_DEFAULT_ACCOMPLISH:
      return {
        ...state,
        defaultAccomplish: state.defaultAccomplish.filter(
          item => item !== action.payload
        ),
      };
    case IntakeActionTypes.RESET_DEFAULT_ACCOMPLISH:
      return {
        ...state,
        defaultAccomplish: [],
      };
    case IntakeActionTypes.ADD_PRIMARY_CARE:
      return {
        ...state,
        primaryCare: [...state.primaryCare, action.payload],
      };
    case IntakeActionTypes.REMOVE_PRIMARY_CARE:
      return {
        ...state,
        primaryCare: state.primaryCare.filter(item => item !== action.payload),
      };
    case IntakeActionTypes.RESET_PRIMARY_CARE:
      return {
        ...state,
        primaryCare: [],
      };
    case IntakeActionTypes.ADD_VIRTUAL_URGENT_CARE:
      return {
        ...state,
        virtualUrgentCare: [...state.virtualUrgentCare, action.payload],
      };
    case IntakeActionTypes.REMOVE_VIRTUAL_URGENT_CARE:
      return {
        ...state,
        virtualUrgentCare: state.virtualUrgentCare.filter(
          item => item !== action.payload
        ),
      };
    case IntakeActionTypes.RESET_VIRTUAL_URGENT_CARE:
      return {
        ...state,
        virtualUrgentCare: [],
      };
    case IntakeActionTypes.ADD_WEIGHT_LOSS:
      return {
        ...state,
        weightLoss: [...state.weightLoss, action.payload],
      };
    case IntakeActionTypes.REMOVE_WEIGHT_LOSS:
      return {
        ...state,
        weightLoss: state.weightLoss.filter(item => item !== action.payload),
      };
    case IntakeActionTypes.RESET_WEIGHT_LOSS:
      return {
        ...state,
        weightLoss: [],
      };
    case IntakeActionTypes.ADD_MENTAL_HEALTH:
      return {
        ...state,
        mentalHealth: [...state.mentalHealth, action.payload],
      };
    case IntakeActionTypes.ADD_ASYNC_MENTAL_HEALTH:
      return {
        ...state,
        asyncMentalHealth: [...state.asyncMentalHealth, action.payload],
      };
    case IntakeActionTypes.ADD_ENCLOMIPHENE:
      return {
        ...state,
        enclomiphene: [...state.enclomiphene, action.payload],
      };
    case IntakeActionTypes.REMOVE_ENCLOMIPHENE:
      return {
        ...state,
        enclomiphene: state.enclomiphene.filter(
          item => item !== action.payload
        ),
      };
    case IntakeActionTypes.RESET_ENCLOMIPHENE:
      return {
        ...state,
        enclomiphene: [],
      };
    case IntakeActionTypes.REMOVE_MENTAL_HEALTH:
      return {
        ...state,
        mentalHealth: state.mentalHealth.filter(
          item => item !== action.payload
        ),
      };
    case IntakeActionTypes.REMOVE_ASYNC_MENTAL_HEALTH:
      return {
        ...state,
        asyncMentalHealth: state.asyncMentalHealth.filter(
          item => item !== action.payload
        ),
      };
    case IntakeActionTypes.RESET_MENTAL_HEALTH:
      return {
        ...state,
        mentalHealth: [],
      };
    case IntakeActionTypes.RESET_ASYNC_MENTAL_HEALTH:
      return {
        ...state,
        asyncMentalHealth: [],
      };
    case IntakeActionTypes.ADD_HAIR_LOSS:
      return {
        ...state,
        hairLoss: [...state.hairLoss, action.payload],
      };
    case IntakeActionTypes.REMOVE_HAIR_LOSS:
      return {
        ...state,
        hairLoss: state.hairLoss.filter(item => item !== action.payload),
      };
    case IntakeActionTypes.RESET_HAIR_LOSS:
      return {
        ...state,
        hairLoss: [],
      };
    case IntakeActionTypes.ADD_CONCERNING_SYMPTOM:
      return {
        ...state,
        concerningSymptoms: [...state.concerningSymptoms, action.payload],
      };
    case IntakeActionTypes.REMOVE_CONCERNING_SYMPTOM:
      return {
        ...state,
        concerningSymptoms: state.concerningSymptoms.filter(
          symptom => symptom !== action.payload
        ),
      };
    case IntakeActionTypes.RESET_CONCERNING_SYMPTOMS:
      return {
        ...state,
        concerningSymptoms: [],
      };
    case IntakeActionTypes.SET_ILV_ENABLED:
      return {
        ...state,
        ilvEnabled: action.payload,
      };

    case IntakeActionTypes.ADD_PRE_WORKOUT:
      return {
        ...state,
        preWorkout: [...state.preWorkout, action.payload],
      };

    case IntakeActionTypes.REMOVE_PRE_WORKOUT:
      return {
        ...state,
        preWorkout: state.preWorkout.filter(item => item !== action.payload),
      };

    case IntakeActionTypes.RESET_PRE_WORKOUT:
      return {
        ...state,
        preWorkout: [],
      };

    default:
      return state;
  }
};

export default intakeReducer;
