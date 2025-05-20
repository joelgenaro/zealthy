import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useFetchMedication } from './useFetchMedication';
import { useEffect } from 'react';
import { useVisitActions } from './useVisit';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';

export const useAddSkincareMedication = (
  specificCare: string | any,
  questionnaires: any
) => {
  const { addMedication } = useVisitActions();

  let medicationName = '';
  let careName = '';
  let careOption: SpecificCareOption | undefined;

  if (
    [
      SpecificCareOption.SKINCARE,
      SpecificCareOption.ACNE,
      SpecificCareOption.ANTI_AGING,
      SpecificCareOption.MELASMA,
      SpecificCareOption.ROSACEA,
    ]?.includes(specificCare)
  ) {
    switch (questionnaires?.[1]?.name) {
      case 'acne-treatment-v2':
        medicationName = 'Acne Medication';
        careName = 'Acne';
        careOption = SpecificCareOption.ACNE;
        break;
      case 'anti-aging-treatment':
        medicationName = 'Anti-Aging Medication';
        careName = 'Anti-Aging';
        careOption = SpecificCareOption.ANTI_AGING;
        break;
      case 'melasma-treatment':
        medicationName =
          'Melasma HQ 6.1 Cream (Hydroquinone / Tretinoin / Kojic Acid / Hydrocortisone)';
        careName = 'Melasma';
        careOption = SpecificCareOption.MELASMA;
        break;
      case 'rosacea-treatment':
        medicationName =
          'Rosacea AIMN Cream (Azelaic Acid / Ivermectin / Metronidazole / Niacinamide)';
        careName = 'Rosacea';
        careOption = SpecificCareOption.ROSACEA;
        break;
    }
  }

  const { medication } = useFetchMedication(medicationName);

  useEffect(() => {
    if (medication) {
      addMedication({
        name: `Prescription ${careName} Treatment`,
        price: medication.price,
        recurring: {
          interval: 'month',
          interval_count: 3,
        },
        type: careName as MedicationType,
        medication_quantity_id: medication.medication_quantity_id,
        display_name: `${careName} Medication - Cream`,
      });
    }
  }, [addMedication, medication, careName]);

  return careOption;
};
