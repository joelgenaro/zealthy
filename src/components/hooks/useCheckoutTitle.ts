import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';
import { ReasonForVisit } from '@/context/AppContext/reducers/types/visit';
import { useMemo } from 'react';
import { useIntakeState } from './useIntake';
import { useSelector } from './useSelector';

const hasSelectedCare = (
  care: ReasonForVisit['reason'],
  careSelections: ReasonForVisit[]
) => {
  return careSelections.length && careSelections.every(c => c.reason === care);
};

export const useCheckoutTitle = () => {
  const { specificCare, potentialInsurance } = useIntakeState();
  const careSelections = useSelector(
    store => store.visit.selectedCare.careSelections
  );

  const title = useMemo(() => {
    if (potentialInsurance?.includes('OON')) {
      return 'Order Summary';
    }
    if (
      potentialInsurance === PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED
    ) {
      return 'Review your treatment and pay';
    }

    if (potentialInsurance === PotentialInsuranceOption.BLUE_CROSS_ILLINOIS) {
      return 'Order Summary';
    }
    if (
      specificCare === 'Weight loss' ||
      hasSelectedCare('Weight loss', careSelections)
    ) {
      return 'Lasting weight loss, within reach!';
    }
    if (
      specificCare === 'Primary care' ||
      hasSelectedCare('Primary care', careSelections)
    ) {
      return 'Virtual primary care, within reach!';
    }
    if (specificCare === 'Preworkout') {
      return 'Performance Protocol';
    }
    if (specificCare === 'Virtual Urgent Care') {
      return 'See a Zealthy provider right now!';
    }

    if (
      specificCare === 'Anxiety or depression' ||
      hasSelectedCare('Anxiety or depression', careSelections)
    ) {
      return 'Psychiatric care, within reach!';
    }

    if (
      specificCare === 'Birth control' ||
      hasSelectedCare('Birth control', careSelections)
    ) {
      return 'Birth control delivered to you, within reach!';
    }

    if (
      ['Acne', 'Anti-Aging', 'Melasma', 'Rosacea', 'Skincare'].includes(
        specificCare || ''
      )
    ) {
      return 'Start your Zealthy visit';
    }

    if (
      specificCare === 'Hair loss' ||
      hasSelectedCare('Hair loss', careSelections)
    ) {
      return 'Full head of hair, within reach!';
    }
    if (
      specificCare === 'Sex + Hair' ||
      hasSelectedCare('Sex + Hair', careSelections)
    ) {
      return 'Almost Done!';
    }

    if (specificCare === 'Mental health') {
      return "You'll pay $0 today";
    }

    if (specificCare === 'Menopause') {
      return 'Your menopause treatment is within reach!';
    }

    return 'Visit & Payment Summary';
  }, [careSelections, potentialInsurance, specificCare]);

  return title;
};
