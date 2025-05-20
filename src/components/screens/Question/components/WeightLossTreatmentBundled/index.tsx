import { useVWO } from '@/context/VWOContext';
import { usePatient } from '@/components/hooks/data';
import { useIntakeSelect } from '@/components/hooks/useIntake';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';
import { useMemo } from 'react';
import WeightLossTreatmentBundledV2 from './components/WeightLossTreatmentBundledV2';
import WeightLossTreatmentBundledV1 from './WeightLossTreatmentBundled';

interface WeightLossTreatmentBundledProps {
  nextPage: (s?: string) => void;
}

const WeightLossTreatmentBundled = ({
  nextPage,
}: WeightLossTreatmentBundledProps) => {
  const { data: patient } = usePatient();
  const potentialInsurance = useIntakeSelect(
    intake => intake.potentialInsurance
  );

  if (
    patient &&
    potentialInsurance === PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED
  ) {
    return <WeightLossTreatmentBundledV2 nextPage={nextPage} />;
  }

  return <WeightLossTreatmentBundledV1 nextPage={nextPage} />;
};

export default WeightLossTreatmentBundled;
