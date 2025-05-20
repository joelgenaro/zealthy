import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';

type ActivationOptions = {
  patientRegion?: string;
  careOption?: SpecificCareOption | null;
  insuranceOption?: PotentialInsuranceOption | null;
};

// activation conditions for
// https://app.vwo.com/#/full-stack/server-ab/341/edit
export const shouldActivate6031 = ({
  patientRegion,
  careOption,
  insuranceOption,
}: ActivationOptions) => {
  return (
    ['AZ', 'GA', 'IN', 'MO', 'NC']?.includes(patientRegion ?? '') &&
    careOption === SpecificCareOption.WEIGHT_LOSS &&
    ![
      PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
      PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
      PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
    ].includes(insuranceOption || PotentialInsuranceOption.DEFAULT)
  );
};
