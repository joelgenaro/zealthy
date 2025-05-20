import { IAppState } from '../types/appState';
import { CommonActionTypes } from '../types/common';
import {
  InsuranceAction,
  InsuranceActionTypes,
  InsuranceCoverage,
  InsurancePolicy,
  InsuranceState,
} from '../types/insurance';

export const insuranceInitialState: InsuranceState = {
  hasInsurance: false,
  payer: null,
  member_id: '',
  policyholder_first_name: '',
  policyholder_last_name: '',
  is_dependent: false,
  plan_name: '',
  plan_status: '',
  plan_type: '',
  member_obligation: NaN,
  out_of_network: false,
};

const insuranceReducer = (
  state: InsuranceState,
  action: InsuranceAction
): InsuranceState => {
  switch (action.type) {
    case CommonActionTypes.INIT:
      return {
        ...state,
        ...(action.payload as IAppState).insurance,
      };
    case CommonActionTypes.RESET:
      return insuranceInitialState;
    case InsuranceActionTypes.ADD_HAS_INSURANCE:
      return {
        ...state,
        hasInsurance: action.payload,
      };
    case InsuranceActionTypes.ADD_USER_IS_DEPENDENT:
      return {
        ...state,
        is_dependent: action.payload,
      };
    case InsuranceActionTypes.ADD_POLICYHOLDER_FIRST_NAME:
      return {
        ...state,
        policyholder_first_name: action.payload,
      };
    case InsuranceActionTypes.ADD_POLICYHOLDER_LAST_NAME:
      return {
        ...state,
        policyholder_last_name: action.payload,
      };
    case InsuranceActionTypes.ADD_INSURANCE_PROVIDER:
      return {
        ...state,
        payer: action.payload,
      };
    case InsuranceActionTypes.ADD_MEMBER_ID:
      return {
        ...state,
        member_id: action.payload,
      };
    case InsuranceActionTypes.ADD_INSURANCE_POLICY:
      return {
        ...state,
        ...(action.payload as InsurancePolicy),
      };
    case InsuranceActionTypes.ADD_INSURANCE_COVERAGE:
      return {
        ...state,
        ...(action.payload as InsuranceCoverage),
      };
    case InsuranceActionTypes.RESET_INSURANCE_COVERAGE:
      return {
        ...state,
        plan_name: '',
        plan_status: '',
        plan_type: '',
        member_obligation: NaN,
        out_of_network: false,
        co_insurance: NaN,
      };
    default:
      return state;
  }
};

export default insuranceReducer;
