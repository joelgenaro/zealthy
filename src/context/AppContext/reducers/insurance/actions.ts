import { Optional } from '@/types/utils/optional';
import { Dispatch } from 'react';
import {
  InsuranceAction,
  InsuranceActionTypes,
  InsuranceCoverage,
  InsurancePolicy,
  InsuranceProvider,
} from '../types/insurance';

export const getInsuranceActions = (dispatch: Dispatch<InsuranceAction>) => ({
  addHasInsurance: (payload: boolean) =>
    dispatch({
      type: InsuranceActionTypes.ADD_HAS_INSURANCE,
      payload,
    }),
  addIsEligible: (payload: boolean) =>
    dispatch({
      type: InsuranceActionTypes.ADD_IS_ELIGIBLE,
      payload,
    }),
  addInsuranceProvider: (payload: InsuranceProvider) =>
    dispatch({
      type: InsuranceActionTypes.ADD_INSURANCE_PROVIDER,
      payload,
    }),
  addMemberId: (payload: string) =>
    dispatch({
      type: InsuranceActionTypes.ADD_MEMBER_ID,
      payload,
    }),
  addPolicyholderFirstName: (payload: string) =>
    dispatch({
      type: InsuranceActionTypes.ADD_POLICYHOLDER_FIRST_NAME,
      payload,
    }),
  addPolicyholderLastName: (payload: string) =>
    dispatch({
      type: InsuranceActionTypes.ADD_POLICYHOLDER_LAST_NAME,
      payload,
    }),
  addUserIsDependent: (payload: boolean) =>
    dispatch({
      type: InsuranceActionTypes.ADD_USER_IS_DEPENDENT,
      payload,
    }),
  addInsurancePolicy: (
    payload: Optional<InsurancePolicy, 'payer' | 'is_dependent'>
  ) =>
    dispatch({
      type: InsuranceActionTypes.ADD_INSURANCE_POLICY,
      payload,
    }),
  addInsuranceCoverage: (payload: InsuranceCoverage) =>
    dispatch({
      type: InsuranceActionTypes.ADD_INSURANCE_COVERAGE,
      payload,
    }),
  resetInsuranceCoverage: () =>
    dispatch({
      type: InsuranceActionTypes.RESET_INSURANCE_COVERAGE,
    }),
});
