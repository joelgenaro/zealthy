import Router from 'next/router';
import { useState } from 'react';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { useCreateProviderTask } from '@/components/hooks/data';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const BloodPressure = () => {
  const [systolic, setSystolic] = useState<string>('');
  const [diastolic, setDiastolic] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const taskType = 'BLOOD_PRESSURE';
  const note = `Patient has provided blood pressure reading. Re-review any relevant prescription requests or forward this to patient's provider. Systolic: ${systolic} Diastolic: ${diastolic}`;
  const handleGenerateTask = useCreateProviderTask();

  //
  async function handleContinue() {
    setLoading(true);
    window.freshpaint?.track('added-blood-pressure');
    await handleGenerateTask(taskType, note);
    setLoading(false);
    return Router.replace('/patient-portal/my-health/vitals/submitted');
  }

  return (
    <Stack gap={{ sm: 6, xs: 3 }}>
      <Stack gap={2}>
        <Typography variant="h2">
          What was your most recent blood pressure reading?
        </Typography>
        <Typography>
          Reading must be from within the last year. This number is typically
          written as systolic/diastolic, for example: 139/82.
        </Typography>
      </Stack>
      <Stack gap={2} direction="row">
        <TextField
          fullWidth
          label="Systolic (bigger)"
          variant="outlined"
          value={systolic}
          onChange={e => setSystolic(e.target.value)}
          inputProps={{ maxLength: 3 }}
        />
        <TextField
          fullWidth
          label="Diastolic (smaller)"
          variant="outlined"
          value={diastolic}
          onChange={e => setDiastolic(e.target.value)}
          inputProps={{ maxLength: 3 }}
        />
      </Stack>
      <LoadingButton
        loading={loading}
        disabled={!(systolic.length > 1 && diastolic.length > 1)}
        onClick={handleContinue}
      >
        Continue
      </LoadingButton>
    </Stack>
  );
};

export default BloodPressure;
