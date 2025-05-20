import CheckMark from '@/components/shared/icons/CheckMark';
import { Medication } from '@/context/AppContext/reducers/types/visit';
import { QuestionnaireQuestionAnswerOptions } from '@/types/questionnaire';
import { ListItemButton, Stack, Typography } from '@mui/material';
import { useCallback } from 'react';

interface BirthControlTreatmentProps {
  birthControl: Medication;
  isSelected: boolean;
  onSelect: (treatment: Medication) => void;
  answerOption: QuestionnaireQuestionAnswerOptions;
  submitAnswer: (answer: QuestionnaireQuestionAnswerOptions) => void;
}

const numberToWord = ['zero', 'one', 'two', 'three', 'four', 'five', 'six'];

const BirthControlTreatment = ({
  answerOption,
  submitAnswer,
  birthControl,
  isSelected = false,
  onSelect,
}: BirthControlTreatmentProps) => {
  const label = `${birthControl.recurring.interval_count} packs - $${birthControl.price} every ${birthControl.recurring.interval_count} ${birthControl.recurring.interval}s`;
  const numberWord = numberToWord[birthControl.recurring.interval_count];
  const subLabel = `Get ${numberWord} packs of birth control pills every ${numberWord} months.`;

  const onClick = useCallback(() => {
    submitAnswer(answerOption);
    onSelect(birthControl);
  }, [answerOption, onSelect, submitAnswer, birthControl]);

  return (
    <ListItemButton
      selected={isSelected}
      key={birthControl.medication_quantity_id}
      onClick={onClick}
    >
      <Stack direction="column">
        <Typography fontWeight="500">{label}</Typography>
        <Typography fontWeight="300" sx={{ fontSize: '13px !important' }}>
          {subLabel}
        </Typography>
      </Stack>
      {isSelected && (
        <CheckMark
          style={{
            position: 'absolute',
            right: 18,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        />
      )}
    </ListItemButton>
  );
};

export default BirthControlTreatment;
