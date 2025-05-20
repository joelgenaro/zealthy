import { useAnswerAction } from '@/components/hooks/useAnswer';
import { useVisitActions, useVisitSelect } from '@/components/hooks/useVisit';
import {
  Medication,
  MedicationType,
} from '@/context/AppContext/reducers/types/visit';
import { QuestionWithName, Questionnaire } from '@/types/questionnaire';
import { List } from '@mui/material';
import { useCallback } from 'react';
import BirthControlTreatment from './component/BirthControlTreatment';

const items: Medication[] = [
  {
    name: 'Birth Control Medication',
    type: MedicationType.BIRTH_CONTROL,
    price: 45,
    dosage: 'Standard Dose',
    quantity: 90,
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
    medication_quantity_id: 284,
  },
  {
    name: 'Birth Control Medication',
    type: MedicationType.BIRTH_CONTROL,
    price: 90,
    dosage: 'Standard Dose',
    quantity: 180,
    recurring: {
      interval: 'month',
      interval_count: 6,
    },
    medication_quantity_id: 285,
  },
];

interface BirthControlTreatmentSelectProps {
  question: QuestionWithName;
  questionnaire: Questionnaire;
}

const BirthControlTreatmentSelect = ({
  question,
  questionnaire,
}: BirthControlTreatmentSelectProps) => {
  const { addMedication } = useVisitActions();
  const selectedMedication = useVisitSelect(visit =>
    visit.medications.find(m => m.type === MedicationType.BIRTH_CONTROL)
  );
  const { submitSingleSelectAnswer } = useAnswerAction({
    name: question.name,
    header: question.header,
    questionnaire: questionnaire.name,
    canvas_linkId: question.canvas_linkId,
    codingSystem: question.codingSystem || questionnaire.codingSystem,
  });

  const handleSelect = useCallback(
    (treatment: Medication) => addMedication(treatment),
    [addMedication]
  );

  return (
    <List sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {items.map((item, idx) => (
        <BirthControlTreatment
          submitAnswer={submitSingleSelectAnswer}
          answerOption={question.answerOptions![idx]}
          key={item.medication_quantity_id}
          birthControl={item}
          onSelect={handleSelect}
          isSelected={
            selectedMedication?.medication_quantity_id ===
            item.medication_quantity_id
          }
        />
      ))}
    </List>
  );
};

export default BirthControlTreatmentSelect;
