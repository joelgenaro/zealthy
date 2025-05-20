import { useState } from 'react';
import { Stack, TextField } from '@mui/material';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { QuestionWithName } from '@/types/questionnaire';
import { useAnswerAction } from '@/components/hooks/useAnswer';

interface PreWorkoutBloodPressureProps {
  question: QuestionWithName;
  nextPage: (nextPage?: string) => void;
}

const BloodPressure = ({
  question,
  nextPage,
}: PreWorkoutBloodPressureProps) => {
  const [systolic, setSystolic] = useState<string>('');
  const [diastolic, setDiastolic] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  //confirm whether or not needed
  // const handleGenerateTask = useCreateProviderTask();
  const { submitFreeTextAnswer } = useAnswerAction(question);
  const [notKnow, setNotKnow] = useState(false);
  async function handleContinue() {
    setLoading(true);
    submitFreeTextAnswer({
      text: notKnow ? "I don't remember." : `${systolic}/${diastolic}`,
    });
    setLoading(false);
    if (notKnow) {
      nextPage('PRE_WORKOUT_DISCLAIMER_BLOOD_PRESSURE');
    } else nextPage();
  }

  return (
    <Stack gap={{ sm: 6, xs: 3 }}>
      <Stack gap={2}></Stack>
      <Stack gap={2} direction="row">
        <TextField
          fullWidth
          label="Systolic (bigger)"
          variant="outlined"
          value={systolic}
          onChange={e => {
            if (notKnow) setNotKnow(false);
            setSystolic(e.target.value);
          }}
          inputProps={{ maxLength: 3 }}
        />
        <TextField
          fullWidth
          label="Diastolic (smaller)"
          variant="outlined"
          value={diastolic}
          onChange={e => {
            if (notKnow) setNotKnow(false);
            setDiastolic(e.target.value);
          }}
          inputProps={{ maxLength: 3 }}
        />{' '}
      </Stack>
      <TextField
        onClick={() => setNotKnow(prev => !prev)}
        sx={{
          '.MuiInputBase-input': {
            textAlign: 'left',
            backgroundColor: notKnow ? '#B8F5CC' : 'transparent',
            cursor: 'pointer',
            textDecoration: 'none',
          },
        }}
        value="I don’t remember."
        type="button"
        fullWidth
      />
      <LoadingButton
        loading={loading}
        disabled={!((systolic.length > 1 && diastolic.length > 1) || notKnow)}
        onClick={handleContinue}
      >
        Continue
      </LoadingButton>
    </Stack>
  );
};

export default BloodPressure;
