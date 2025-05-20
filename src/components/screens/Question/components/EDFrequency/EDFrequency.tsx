import { useAnswerAction } from '@/components/hooks/useAnswer';
import { useVisitActions, useVisitSelect } from '@/components/hooks/useVisit';
import {
  MedicationType,
  OtherOption,
} from '@/context/AppContext/reducers/types/visit';
import { Database } from '@/lib/database.types';
import { QuestionWithName } from '@/types/questionnaire';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useCallback, useMemo, useState } from 'react';
import RadioOptionList from '../RadioOptionList';

import { useIsMobile } from '@/components/hooks/useIsMobile';
import { MedicationName } from '@/constants/ed-mapping/types';
import { ED_MAPPING } from '@/constants/ed-mapping';

type QuantityValue = {
  quantity: number | undefined;
  medication_quantity_id: number | null;
  otherOptions: OtherOption[];
};

type Option = {
  label: string;
  options: {
    label: string;
    subheader?: string | null;
    value: QuantityValue;
  }[];
};

const optionsByDosage = (
  medicationName: MedicationName,
  dosage: string,
  fontSize: string,
  subheaderFontSize?: string
): Option[] => {
  const quantities = ED_MAPPING[medicationName][dosage].quantities;
  const popular = quantities.filter(q => q.popular);
  const others = quantities.filter(q => !q.popular);

  return [
    {
      label: 'Most popular',
      options: popular.map(q => ({
        label: `<span style="font-size: ${fontSize}">${q.display_name}</span>`,
        value: {
          quantity: q.value,
          medication_quantity_id: q.medication_quantity_id,
          otherOptions: q.otherOptions,
        },
      })),
    },
    {
      label: 'Additional options',
      options: others.map(q => ({
        label: `<span style="font-size: ${fontSize}">${q.display_name}</span>`,

        value: {
          quantity: q.value,
          medication_quantity_id: q.medication_quantity_id,
          otherOptions: q.otherOptions,
        },
      })),
    },
  ];
};

interface EDFrequencyProps {
  question: QuestionWithName;
}

const EDFrequency = ({ question }: EDFrequencyProps) => {
  const isMobile = useIsMobile();
  const { submitFreeTextAnswer } = useAnswerAction(question);
  const { updateMedication } = useVisitActions();
  const supabase = useSupabaseClient<Database>();
  const medication = useVisitSelect(visit =>
    visit.medications.find(m => m?.type === MedicationType.ED)
  );

  const [currentValue, setCurrentValue] = useState<QuantityValue>({
    quantity: medication?.quantity,
    medication_quantity_id: medication?.medication_quantity_id || null,
    otherOptions: medication?.otherOptions || [],
  });

  if (!medication || !medication.dosage) {
    throw new Error('No medication or dosage was selected');
  }
  const isHardies = medication?.name?.includes('Hardies');
  const options = useMemo(() => {
    return optionsByDosage(
      medication.name as MedicationName,
      medication.dosage as string,
      isMobile ? '14px' : '16px',
      isMobile ? '11px' : '13px'
    );
  }, [isMobile, medication.dosage, medication.name]);

  const handleQuantity = useCallback(
    (value: QuantityValue) => {
      if (!value?.medication_quantity_id) {
        return;
      }
      const specificOption = value.otherOptions.find(
        option => option.medication_quantity_id === value.medication_quantity_id
      );
      updateMedication({
        type: MedicationType.ED,
        update: {
          ...value,
          price: specificOption?.price,
          discounted_price: specificOption?.price! - 20,
          recurring: specificOption?.recurring,
        },
      });
      setCurrentValue(value);
      submitFreeTextAnswer({
        text: String(value.quantity),
      });
    },
    [submitFreeTextAnswer, supabase, updateMedication]
  );

  const isSelected = useCallback(
    (value: QuantityValue) =>
      currentValue.medication_quantity_id === value.medication_quantity_id,
    [currentValue.medication_quantity_id]
  );

  return (
    <RadioOptionList
      isSelected={isSelected}
      groups={options}
      onSelect={handleQuantity}
    />
  );
};

export default EDFrequency;
