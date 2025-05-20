import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useMemo } from 'react';
import { useIntakeSelect } from './useIntake';
import { useSelector } from './useSelector';

export const useCalculateSpecificCare = () => {
  const specificCare = useIntakeSelect(intake => intake.specificCare);
  const careSelections = useSelector(
    store => store.visit.selectedCare.careSelections
  );
  const calculatedSpecificCare = useMemo(() => {
    if (!!careSelections.find(c => c.reason === 'Weight loss')) {
      return SpecificCareOption.WEIGHT_LOSS;
    }

    if (!!careSelections.find(c => c.reason === 'Anxiety or depression')) {
      return SpecificCareOption.ANXIETY_OR_DEPRESSION;
    }

    if (!!careSelections.find(c => c.reason === 'Hair loss')) {
      return SpecificCareOption.HAIR_LOSS;
    }

    if (!!careSelections.find(c => c.reason === 'Erectile dysfunction')) {
      return SpecificCareOption.ERECTILE_DYSFUNCTION;
    }

    if (!!careSelections.find(c => c.reason === 'Birth control')) {
      return SpecificCareOption.BIRTH_CONTROL;
    }

    if (!!careSelections.find(c => c.reason === 'Primary care')) {
      return SpecificCareOption.PRIMARY_CARE;
    }

    if (!!careSelections.find(c => c.reason === 'Enclomiphene')) {
      return SpecificCareOption.ENCLOMIPHENE;
    }

    if (!!careSelections.find(c => c.reason === 'Acne')) {
      return SpecificCareOption.ACNE;
    }

    if (!!careSelections.find(c => c.reason === 'Rosacea')) {
      return SpecificCareOption.ROSACEA;
    }

    if (!!careSelections.find(c => c.reason === 'Fine Lines & Wrinkles')) {
      return SpecificCareOption.ANTI_AGING;
    }

    if (
      !!careSelections.find(c => c.reason === 'Hyperpigmentation Dark Spots')
    ) {
      return SpecificCareOption.MELASMA;
    }

    if (!!careSelections.find(c => c.reason === 'Menopause')) {
      return SpecificCareOption.MENOPAUSE;
    }

    return SpecificCareOption.DEFAULT;
  }, [careSelections]);

  if (specificCare === 'Skincare') {
    return calculatedSpecificCare;
  }

  return specificCare || calculatedSpecificCare;
};
