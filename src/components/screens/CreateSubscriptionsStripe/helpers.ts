import { CoachingState } from '@/context/AppContext/reducers/types/coaching';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';

export const MEDICATION_QUERY = `
  medication_dosage!inner(
    dosage!inner(dosage),
    medication_quantity!inner(
      quantity!inner(quantity),
      price,
      id
    )
  )
`;

export const medicationType = (care: SpecificCareOption | null) => {
  if (care === 'Fine Lines & Wrinkles') {
    return 'Anti-Aging';
  }

  if (care === 'Acne') {
    return 'Acne';
  }

  if (care === 'Hyperpigmentation Dark Spots') {
    return 'Melasma';
  }

  if (care === 'Rosacea') {
    return 'Rosacea';
  }

  return null;
};

export const medicationName = (care: SpecificCareOption | null) => {
  switch (care) {
    case 'Acne':
      return 'Acne Medication';
    case 'Fine Lines & Wrinkles':
      return 'Anti-Aging Medication';
    case 'Hyperpigmentation Dark Spots':
      return 'Melasma HQ 6.1 Cream (Hydroquinone / Tretinoin / Kojic Acid / Hydrocortisone)';
    case 'Rosacea':
      return 'Rosacea AIMN Cream (Azelaic Acid / Ivermectin / Metronidazole / Niacinamide)';
    default:
      return null;
  }
};

type MedicationName = {
  name: string;
  dosage?: string;
};

export const weightLossMedicationName = (
  plan: CoachingState
): MedicationName => {
  if (['Oral', 'Semaglutide'].every(w => plan.name.includes(w))) {
    return {
      name: 'Oral GLP1 Medication',
      dosage: '3 mg',
    };
  }

  if (
    plan.name.includes('+') ||
    plan.name.toLowerCase()?.includes('semaglutide flexible')
  ) {
    return {
      name: 'GLP1 Medication',
    };
  }

  return {
    name: 'Weight Loss Medication',
  };
};

export const isBundledPlan = (plan: CoachingState) => {
  return [
    'Zealthy Weight Loss + Semaglutide Program',
    'Zealthy Weight Loss + Tirzepatide Program',
    'Zealthy Weight Loss + Oral Semaglutide Tablets',
  ].includes(plan.name);
};

export const getSpecialWeightLossMedication = (plan: CoachingState) => {
  return [
    'Zealthy Weight Loss + Semaglutide Program',
    'Zealthy Weight Loss + Tirzepatide Program',
    'Zealthy Weight Loss Semaglutide Flexible',
    'Zealthy Weight Loss + Oral Semaglutide Tablets',
  ].includes(plan.name)
    ? plan.name
    : 'Wegovy';
};

export const planToEvent: { [key: string]: string } = {
  'Zealthy Weight Loss + Semaglutide Program':
    'purchase-weight-loss-semaglutide-bundle',
  'Zealthy Weight Loss + Tirzepatide Program':
    'purchase-weight-loss-tirzepatide-bundle',
  'Zealthy Weight Loss Flexible': 'weight-loss-flexible-payment',
  'Zealthy Weight Loss Semaglutide Flexible':
    'weight-loss-flexible-semaglutide-payment',
  'Zealthy Weight Loss + Oral Semaglutide Tablets':
    'weight-loss-oral-semaglutide-payment',
};
