import {
  ChangeEventHandler,
  FormEventHandler,
  useCallback,
  useState,
} from 'react';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { useAnswerAction } from '@/components/hooks/useAnswer';
import { QuestionWithName } from '@/types/questionnaire';
import { usePatientActions } from '@/components/hooks/usePatient';

interface WeightGoalProps {
  question: QuestionWithName;
  nextPage: (nextPage?: string) => void;
}

const WeightGoal = ({ question, nextPage }: WeightGoalProps) => {
  const [weight, setWeight] = useState<number | null>();
  const [loading, setLoading] = useState(false);
  const { submitFreeTextAnswer } = useAnswerAction(question);
  const { addGoalWeight } = usePatientActions();

  const handleLbs: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      const { value } = e.target;

      if (value && Number(value) < 1) {
        return;
      }
      setWeight(value ? Number(value) : null);
      addGoalWeight(value ? Number(value) : null);
    },
    [addGoalWeight]
  );

  const onSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async e => {
      e.preventDefault();
      setLoading(true);
      submitFreeTextAnswer({
        text: `Patient's ideal weight: ${weight} lbs`,
      });
      nextPage();
      setLoading(false);
    },
    [submitFreeTextAnswer, weight, nextPage]
  );

  return (
    <Stack component="form" onSubmit={onSubmit} direction="column" gap="48px">
      <Typography variant="h2" sx={{ width: '70%' }}>
        {"What's your dream weight?⚖️"}
      </Typography>
      <TextField
        name="pound"
        required
        type="number"
        fullWidth
        placeholder="Enter your ideal weight"
        value={weight ?? ''}
        onChange={handleLbs}
        sx={{
          backgroundColor: '#EBEBEB',
          borderRadius: '5px',
        }}
        InputProps={{
          endAdornment: <InputAdornment position="end">lbs</InputAdornment>,
        }}
      />
      <LoadingButton
        loading={loading}
        disabled={loading || !weight}
        type="submit"
      >
        {'Continue'}
      </LoadingButton>
    </Stack>
  );
};

export default WeightGoal;
