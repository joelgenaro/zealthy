import { Database } from '@/lib/database.types';
import { Optional } from '@/types/utils/optional';
import { CommonAction } from './common';

export type InsuranceProvider =
  | Pick<
      Database['public']['Tables']['payer']['Row'],
      'name' | 'id' | 'external_payer_id'
    >
  | null
  | undefined;

// we need a way to pass payer to insurance policy
export interface InsurancePolicy {
  member_id: string;
  payer: InsuranceProvider;
  policyholder_first_name: string;
  policyholder_last_name: string;
  is_dependent: boolean;
}

export interface InsuranceCoverage {
  plan_start?: string;
  plan_status: string;
  plan_name: string;
  plan_type: string;
  member_obligation: number; //in cents
  co_insurance?: number;
  out_of_network: boolean;
}

export type InsurancePayload =
  Database['public']['Tables']['insurance_policy']['Row'] & {
    payer: InsuranceProvider;
  };

export interface InsuranceState extends InsurancePolicy, InsuranceCoverage {
  hasInsurance: boolean;
}

export enum InsuranceActionTypes {
  ADD_HAS_INSURANCE = 'ADD_HAS_INSURANCE',
  ADD_INSURANCE_PROVIDER = 'ADD_INSURANCE_PROVIDER',
  ADD_MEMBER_ID = 'ADD_MEMBER_ID',
  ADD_POLICYHOLDER_FIRST_NAME = 'ADD_POLICYHOLDER_FIRST_NAME',
  ADD_POLICYHOLDER_LAST_NAME = 'ADD_POLICYHOLDER_LAST_NAME',
  ADD_USER_IS_DEPENDENT = 'ADD_USER_IS_DEPENDENT',
  ADD_IS_ELIGIBLE = 'ADD_IS_ELIGIBLE',
  ADD_INSURANCE_POLICY = 'ADD_INSURANCE_POLICY',
  ADD_INSURANCE_COVERAGE = 'ADD_INSURANCE_COVERAGE',
  RESET_INSURANCE_COVERAGE = 'RESET_INSURANCE_COVERAGE',
}

export type InsuranceAction =
  | CommonAction
  | {
      type:
        | InsuranceActionTypes.ADD_MEMBER_ID
        | InsuranceActionTypes.ADD_POLICYHOLDER_FIRST_NAME
        | InsuranceActionTypes.ADD_POLICYHOLDER_LAST_NAME;
      payload: string;
    }
  | {
      type:
        | InsuranceActionTypes.ADD_HAS_INSURANCE
        | InsuranceActionTypes.ADD_USER_IS_DEPENDENT
        | InsuranceActionTypes.ADD_IS_ELIGIBLE;
      payload: boolean;
    }
  | {
      type: InsuranceActionTypes.ADD_INSURANCE_PROVIDER;
      payload: InsuranceProvider;
    }
  | {
      type: InsuranceActionTypes.ADD_INSURANCE_POLICY;
      payload: Optional<InsurancePolicy, 'payer' | 'is_dependent'>;
    }
  | {
      type: InsuranceActionTypes.ADD_INSURANCE_COVERAGE;
      payload: InsuranceCoverage;
    }
  | {
      type: InsuranceActionTypes.RESET_INSURANCE_COVERAGE;
    };
