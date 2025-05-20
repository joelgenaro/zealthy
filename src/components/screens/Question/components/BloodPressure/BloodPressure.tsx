import { useAnswerAction } from '@/components/hooks/useAnswer';
import { usePostCheckoutQuestionnaireQuestion } from '@/components/hooks/usePostCheckoutQuestionnaireQuestion';
import { useQuestionnaireQuestion } from '@/components/hooks/useQuestionnaireQuestion';
import { FreeTextAnswer } from '@/context/AppContext/reducers/types/answer';
import { QuestionWithName } from '@/types/questionnaire';
import { Box, Button, Stack, TextField } from '@mui/material';
import {
  ChangeEventHandler,
  FormEventHandler,
  useCallback,
  useState,
} from 'react';

interface BloodPressureProps {
  question: QuestionWithName;
  answer: FreeTextAnswer[];
}

const BloodPressure = ({ question, answer }: BloodPressureProps) => {
  const [systolic, setSystolic] = useState(
    answer?.[0].valueString.split('/')[0] || ''
  );
  const [diastolic, setDiastolic] = useState(
    answer?.[0].valueString.split('/')[1] || ''
  );
  const { submitFreeTextAnswer } = useAnswerAction(question);
  const { nextPath } = usePostCheckoutQuestionnaireQuestion();
  const preCheckoutNextPath = useQuestionnaireQuestion();

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    e => {
      e.preventDefault();
      submitFreeTextAnswer({
        text: `${systolic}/${diastolic}`,
      });
      nextPath();
    },
    [diastolic, nextPath, submitFreeTextAnswer, systolic]
  );

  const handleIDontKnow = useCallback(() => {
    submitFreeTextAnswer({
      text: 'I don’t remember.',
    });
    nextPath('BLOOD_PRESSURE_DISCLAIMER');
  }, [nextPath, submitFreeTextAnswer]);

  const handleSystolic: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      setSystolic(e.target.value);
    },
    []
  );

  const handleDiastolic: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      setDiastolic(e.target.value);
    },
    []
  );

  return (
    <Stack
      component="form"
      onSubmit={handleSubmit}
      direction="column"
      gap="48px"
    >
      <Box display="flex" flexDirection="column" gap="16px">
        <Stack direction="row" gap="16px">
          <TextField
            value={systolic}
            required
            type="number"
            fullWidth
            onChange={handleSystolic}
            placeholder="Systolic (bigger)"
          />
          <TextField
            value={diastolic}
            required
            type="number"
            fullWidth
            onChange={handleDiastolic}
            placeholder="Diastolic (smaller)"
          />
        </Stack>
        <TextField
          onClick={handleIDontKnow}
          sx={{
            '.MuiInputBase-input': {
              textAlign: 'left',
            },
          }}
          value="I don’t remember."
          type="button"
          fullWidth
        />
      </Box>

      <Stack gap="10px">
        <Button type="submit">{'Continue'}</Button>
      </Stack>
    </Stack>
  );
};

export default BloodPressure;
