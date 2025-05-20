import { Clinician, StateResponse } from '../types';

export const availableCliniciansCash = (data: StateResponse): Clinician[] => {
  if (!data) {
    return [];
  }

  const { state_cash_payer, state_clinician } = data;

  if (!state_cash_payer || !state_cash_payer.accept_treat_me_now) {
    return [];
  }

  if (!state_clinician || state_clinician.length === 0) {
    return [];
  }

  return state_clinician.map(clinician => clinician.clinician).filter(Boolean);
};
