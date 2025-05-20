import { Database } from '@/lib/database.types';
import { mapMedicationToCareSelection } from '@/utils/mapMedicationToCareSelection';
import { getServiceSupabase } from '@/utils/supabase';

type MedicationDosage =
  Database['public']['Tables']['medication_dosage']['Row'] & {
    medication: Database['public']['Tables']['medication']['Row'];
  };

export const calculatedSpecificCare = async (nationalDrugCode: string) => {
  const supabase = getServiceSupabase();

  const medicationDosage = await supabase
    .from('medication_dosage')
    .select('*, medication!inner(*)')
    .eq('national_drug_code', nationalDrugCode)
    .limit(1)
    .maybeSingle()
    .then(({ data }) => data as MedicationDosage | null);

  let zealthyCare = 'Primary care';
  if (medicationDosage?.medication.display_name) {
    zealthyCare =
      mapMedicationToCareSelection[medicationDosage.medication.display_name];
  }

  return zealthyCare;
};
