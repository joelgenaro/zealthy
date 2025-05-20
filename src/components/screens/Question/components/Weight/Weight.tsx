import { useAnswerAction, useAnswerAsync } from '@/components/hooks/useAnswer';
import {
  usePatientActions,
  usePatientState,
} from '@/components/hooks/usePatient';
import { Questionnaire, QuestionWithName } from '@/types/questionnaire';
import { Stack, TextField, Typography, Box, Button } from '@mui/material';
import { ChangeEventHandler, FormEventHandler, useCallback } from 'react';
import toast from 'react-hot-toast';

interface WeightProps {
  questionnaire: Questionnaire;
  question: QuestionWithName;
  onClick: (nextPage?: string) => void;
}

const Weight = ({ questionnaire, question, onClick }: WeightProps) => {
  const { addWeight } = usePatientActions();
  const { weight } = usePatientState();
  const { submitFreeTextAnswer } = useAnswerAction(question);
  const { submitAnswer } = useAnswerAsync(questionnaire);

  const handleLbs: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      const { value } = e.target;
      addWeight(value ? Number(value) : null);
    },
    [addWeight]
  );

  const onSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async e => {
      e.preventDefault();
      if (weight! >= 500) {
        toast.error('Max weight is 499 lbs');
        return;
      }
      const answer = submitFreeTextAnswer({
        text: `${weight} lbs`,
      });

      await submitAnswer(answer);

      onClick(question.next);
    },
    [onClick, question.next, submitFreeTextAnswer, weight]
  );

  return (
    <Stack component="form" onSubmit={onSubmit} direction="column" gap="48px">
      <Box display="flex" flexDirection="column" gap="10px">
        <Typography variant="h3">Weight</Typography>
        <TextField
          required
          type="number"
          fullWidth
          placeholder="lbs"
          value={weight ?? ''}
          onChange={handleLbs}
        />
      </Box>
      <Stack gap="10px">
        <Button type="submit">Continue</Button>
      </Stack>
    </Stack>
  );
};

export default Weight;
