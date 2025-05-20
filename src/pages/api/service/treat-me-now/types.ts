import { Database } from '@/lib/database.types';

export type AvailabilityRequestQuery = {
  region: string;
  patientId: number;
};

export type StateClinician =
  Database['public']['Tables']['state_clinician']['Row'] & {
    clinician: Clinician;
  };
export type Clinician = Pick<
  Database['public']['Tables']['clinician']['Row'],
  'accept_treat_me_now' | 'id'
>;

type StatePayerClinician =
  Database['public']['Tables']['state_payer_clinician']['Row'] & {
    clinician: Clinician;
  };

export type StatePayer = Database['public']['Tables']['state_payer']['Row'] & {
  state_payer_clinician: StatePayerClinician[];
};

export type StateCashPayer = Pick<
  Database['public']['Tables']['state_cash_payer']['Row'],
  'accept_treat_me_now'
>;

export type StateResponse = Database['public']['Tables']['state']['Row'] & {
  state_cash_payer: StateCashPayer;
  state_clinician: StateClinician[];
};

export type StatePayerResponse =
  Database['public']['Tables']['state']['Row'] & {
    state_payer: StatePayer[];
  };

export type AvailabilityResponse = {
  available: boolean;
  estimatedWaitTime: number | null;
};

export type Data =
  | {
      message: string;
      description?: string;
    }
  | AvailabilityResponse;
