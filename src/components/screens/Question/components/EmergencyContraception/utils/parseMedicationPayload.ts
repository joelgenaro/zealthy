import {
  Medication,
  MedicationType,
} from '@/context/AppContext/reducers/types/visit';
import { MedicationPayload } from '@/types/medicationPayload';

const emergencyContraception: Medication = {
  type: MedicationType.EMERGENCY_BIRTH_CONTROL,
  name: 'Emergency Contraception',
  quantity: 1,
  dosage: '1.5 mg',
  medication_quantity_id: null,
  recurring: {
    interval: '',
    interval_count: 0,
  },
};

export const parseMedicationPayload = (data: MedicationPayload): Medication => {
  const response = data?.medication_dosage?.[0].medication_quantity?.[0];
  if (!response) {
    throw new Error('Could not find medication');
  }

  return {
    ...emergencyContraception,
    price: response.price,
    medication_quantity_id: response.id,
  };
};
