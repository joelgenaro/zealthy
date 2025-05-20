import { ChangeEventHandler, useCallback, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { usePatient, usePatientWeightLogs } from '@/components/hooks/data';
import { useAnswerAction, useAnswerAsync } from '@/components/hooks/useAnswer';
import { Database } from '@/lib/database.types';
import { Questionnaire, QuestionWithName } from '@/types/questionnaire';
import Router from 'next/router';
import { useSearchParams } from 'next/navigation';
import { useAddWeightLog } from '@/components/hooks/mutations';

interface WeightProps {
  questionnaire: Questionnaire;
  question: QuestionWithName;
  onClick: (nextPage?: string) => void;
}
const WeightLossCheckin = ({
  questionnaire,
  question,
  onClick,
}: WeightProps) => {
  const supabase = useSupabaseClient<Database>();
  const searchParams = useSearchParams();
  const page = searchParams?.get('page');
  const { data: patient } = usePatient();
  const { data: patientWeight } = usePatientWeightLogs();
  const addWeight = useAddWeightLog();

  const mostRecentWeight = patientWeight?.[patientWeight?.length - 1];

  const [weight, setWeight] = useState<number>();
  const { submitFreeTextAnswer } = useAnswerAction(question);
  const { submitAnswer } = useAnswerAsync(questionnaire);

  const handleGoalWeight: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      const { value } = e.target;
      if ((value && Number(value) > 1500) || (value && Number(value) < 0)) {
        return;
      }
      setWeight(value ? Number(value) : undefined);
    },
    []
  );

  const onSubmit = useCallback(async () => {
    const answer = submitFreeTextAnswer({
      text: `${weight} lbs`,
    });

    await submitAnswer(answer);
    await addWeight.mutateAsync({
      weight: weight!,
      patient_id: patient?.id,
      date_logged: new Date().toISOString(),
    });

    if ((mostRecentWeight?.weight ?? 0) > (weight ?? Infinity)) {
      Router.push(
        {
          pathname:
            '/patient-portal/questionnaires-v2/weight-loss-quarterly-checkin/WEIGHT_L_CHECKIN_Q1',
          query: { page: 'congrats' },
        },
        undefined,
        { shallow: true }
      );
    } else onClick(question.next);
  }, [onClick, question.next, submitFreeTextAnswer, weight]);

  return (
    <Container maxWidth="xs">
      {!page ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
            {'What’s your current weight?'}
          </Typography>

          <Box display="flex" flexDirection="column" gap="10px">
            <Typography variant="h3">Weight</Typography>
            <TextField
              name="pound"
              required
              type="number"
              fullWidth
              placeholder="lbs"
              value={weight ?? ''}
              onChange={handleGoalWeight}
            />
          </Box>

          <Stack mt={'1rem'}>
            <Button onClick={onSubmit}>{'Continue'}</Button>
          </Stack>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            width: '100%',
          }}
        >
          <Typography variant="h2">
            {'Congratulations on your weight loss progress!'}
          </Typography>
          <Typography>
            {
              'We’re so happy to see that your hard work is paying off. We’re here to help. Just answer a few questions so that we can help with your refill.'
            }
          </Typography>
          <Box sx={{ marginTop: '1rem' }}>
            <Button fullWidth onClick={() => onClick(question.next)}>
              {'Continue'}
            </Button>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default WeightLossCheckin;
