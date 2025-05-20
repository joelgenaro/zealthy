import { useAnswerAction } from '@/components/hooks/useAnswer';
import { useVisitActions } from '@/components/hooks/useVisit';
import CheckMark from '@/components/shared/icons/CheckMark';
import { CodedAnswer } from '@/context/AppContext/reducers/types/answer';
import {
  MedicationType,
  Medication,
} from '@/context/AppContext/reducers/types/visit';
import { Database } from '@/lib/database.types';
import { MedicationPayload } from '@/types/medicationPayload';
import {
  Questionnaire,
  QuestionnaireQuestionAnswerOptions,
  QuestionWithName,
} from '@/types/questionnaire';
import { List, ListItemButton } from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useCallback, useEffect, useState } from 'react';
import { parseMedicationPayload } from './utils/parseMedicationPayload';

interface EmergencyContraceptionProps {
  question: QuestionWithName;
  answer: CodedAnswer[];
  questionnaire: Questionnaire;
}

const EmergencyContraception = ({
  question,
  answer,
  questionnaire,
}: EmergencyContraceptionProps) => {
  const [emergencyMed, setEmergencyMed] = useState<Medication | null>(null);
  const supabase = useSupabaseClient<Database>();
  const { submitSingleSelectAnswer } = useAnswerAction({
    name: question.name,
    header: question.header,
    questionnaire: questionnaire.name,
    canvas_linkId: question.canvas_linkId,
    codingSystem: question.codingSystem || questionnaire.codingSystem,
  });
  const { addMedication, removeMedication } = useVisitActions();

  const handleAnswer = useCallback(
    (answer: QuestionnaireQuestionAnswerOptions) => {
      submitSingleSelectAnswer(answer);
      if (answer.text === 'Yes') {
        addMedication(emergencyMed!);
      } else {
        removeMedication(MedicationType.EMERGENCY_BIRTH_CONTROL);
      }
    },
    [addMedication, emergencyMed, removeMedication, submitSingleSelectAnswer]
  );

  useEffect(() => {
    supabase
      .from('medication')
      .select('medication_dosage(medication_quantity(id, price))')
      .eq('name', 'Levonorgestrel')
      .single()
      .then(({ data }) => parseMedicationPayload(data as MedicationPayload))
      .then(setEmergencyMed);
  }, [supabase]);

  return (
    <List
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '0',
      }}
    >
      {question.answerOptions!.map(a => {
        const isSelected = !!answer?.find(
          ans => ans.valueCoding.code === a.code
        );

        return (
          <ListItemButton
            selected={isSelected}
            key={a.text}
            onClick={() => handleAnswer(a)}
          >
            {a.text}
            {isSelected ? <CheckMark style={{ marginLeft: 'auto' }} /> : null}
          </ListItemButton>
        );
      })}
    </List>
  );
};

export default EmergencyContraception;
