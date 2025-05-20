import { Database } from '@/lib/database.types';
import { addPatientPreferredPharmacyToDosespot } from './addPatientPreferredPharmacyToDosespot';
import { addPharmacyToPatientInDosespot } from './addPharmacyToPatientInDosespot';
import { createDosespotPatient } from './createDosespotPatient';

type Patient = Database['public']['Tables']['patient']['Row'];

export const handleActivePatient = async (patient: Patient) => {
  // Create dosespot patient
  let dosespotPatientId = patient.dosespot_patient_id;

  try {
    if (!dosespotPatientId) {
      const { data: dosespotPatient } = await createDosespotPatient(patient);

      dosespotPatientId = dosespotPatient?.dosespot_patient_id ?? null;
    }

    if (!dosespotPatientId) {
      throw new Error(`Could not find/create dosespot patient id`);
    }

    return Promise.allSettled([
      // Add GoGoMeds pharmacy
      await addPharmacyToPatientInDosespot(
        dosespotPatientId,
        Number(process.env.DOSESPOT_GOGOMEDS_PHARMACY_ID),
        false
      ),
      // Add Preferred Pharmacy
      await addPatientPreferredPharmacyToDosespot(
        patient.id,
        dosespotPatientId
      ),
    ]);
  } catch (err) {
    throw err;
  }
};
