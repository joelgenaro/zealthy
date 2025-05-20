import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';

export const mapMedicationToCareSelection: { [key: string]: string } = {
  'ED Medication': SpecificCareOption.ERECTILE_DYSFUNCTION,
  'Birth Control Medication': SpecificCareOption.BIRTH_CONTROL,
  'Hair Loss Medication': SpecificCareOption.HAIR_LOSS,
  'Weight Loss Medication': SpecificCareOption.WEIGHT_LOSS,
  'Mental Health Medication': SpecificCareOption.ASYNC_MENTAL_HEALTH,
  'Acne Medication': SpecificCareOption.ACNE,
  'Enclomiphene Medication': SpecificCareOption.ENCLOMIPHENE,
  'EDHL Medication': SpecificCareOption.SEX_PLUS_HAIR,
  'Menopause Medication': SpecificCareOption.MENOPAUSE,
  'Sleep Support: Ramelteon': SpecificCareOption.SLEEP,
};
