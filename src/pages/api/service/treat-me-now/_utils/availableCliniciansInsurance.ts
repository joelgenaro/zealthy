import { Clinician, StatePayerResponse } from '../types';

export const availableCliniciansInsurance = (
  data: StatePayerResponse
): Clinician[] => {
  if (!data) {
    return [];
  }

  const { state_payer } = data;

  if (!state_payer || state_payer.length === 0) {
    return [];
  }

  const { state_payer_clinician } = state_payer[0];

  if (!state_payer_clinician || state_payer_clinician.length === 0) {
    return [];
  }

  return state_payer_clinician
    .map(clinician => clinician.clinician)
    .filter(Boolean);
};
