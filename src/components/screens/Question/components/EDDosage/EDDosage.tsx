import { useAnswerAction } from '@/components/hooks/useAnswer';
import { useVisitActions, useVisitSelect } from '@/components/hooks/useVisit';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import { QuestionWithName } from '@/types/questionnaire';
import { getKeys } from '@/utils/getKeys';
import { useCallback, useMemo } from 'react';
import RadioOptionList from '../RadioOptionList';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { MedicationName } from '@/constants/ed-mapping/types';
import { ED_MAPPING } from '@/constants/ed-mapping';

type Option = {
  label: string;
  options: {
    label: string;
    value: string;
  }[];
};

const optionsByMedication = (
  medicationName: MedicationName,
  fontSize: string
): Option[] => {
  const keys = getKeys(ED_MAPPING[medicationName]);
  const recommended = keys.filter(
    key => ED_MAPPING[medicationName][key].recommended
  );
  const others = keys.filter(
    key => !ED_MAPPING[medicationName][key].recommended
  );

  return [
    {
      label: 'Recommended dosage',
      options: recommended.map(key => ({
        label: `<span style="font-size: ${fontSize}">${key}</span><span style="font-size: ${fontSize}">$${ED_MAPPING[
          medicationName
        ][key].price.toFixed(2)}/dose</span>`,
        value: key as string,
      })),
    },
    {
      label: 'Other dosages',
      options: others.map(key => ({
        label: `<span style="font-size: ${fontSize}">${key}</span><span style="font-size: ${fontSize}">$${ED_MAPPING[
          medicationName
        ][key].price.toFixed(2)}/dose</span>`,
        value: key as string,
      })),
    },
  ];
};

interface EDDosageProps {
  question: QuestionWithName;
}

const EDDosage = ({ question }: EDDosageProps) => {
  const isMobile = useIsMobile();
  const { submitFreeTextAnswer } = useAnswerAction(question);
  const { updateMedication } = useVisitActions();
  const medication = useVisitSelect(visit =>
    visit.medications.find(m => m.type === MedicationType.ED)
  );

  if (!medication) {
    throw new Error('No medication was selected');
  }

  const { name, dosage } = medication;

  const options = useMemo(() => {
    return optionsByMedication(
      name as MedicationName,
      isMobile ? '14px' : '16px'
    );
  }, [isMobile, name]);

  const handleDosage = useCallback(
    (dosage: string) => {
      updateMedication({
        type: MedicationType.ED,
        update: { dosage },
      });
      submitFreeTextAnswer({
        text: dosage,
      });
    },
    [submitFreeTextAnswer, updateMedication]
  );

  const isSelected = useCallback((value: string) => dosage === value, [dosage]);

  return (
    <RadioOptionList
      isSelected={isSelected}
      groups={options}
      onSelect={handleDosage}
    />
  );
};

export default EDDosage;
