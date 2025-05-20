import { ChangeEvent, useCallback, useState } from 'react';
import { Link, Stack, TextField, Typography } from '@mui/material';
import { useApi } from '@/context/ApiContext';
import { usePatient } from '@/components/hooks/data';
import { Endpoints } from '@/types/endpoints';
import ErrorMessage from '@/components/shared/ErrorMessage';
import LoadingButton from '@/components/shared/Button/LoadingButton';

interface SSNVerificationProps {
  nextPage: (nextPage?: string) => void;
}

const SSNVerification = ({ nextPage }: SSNVerificationProps) => {
  const [last4, setLast4] = useState('');
  const [loading, setLoading] = useState(false);
  const { data: patient } = usePatient();
  const [error, setError] = useState('');
  const api = useApi();

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setLast4(e.target.value);
    setError('');
  }, []);

  const handleSubmit = useCallback(() => {
    if (last4.length < 4) {
      setError('Please provide last 4 digits of your social security');
      return;
    }

    if (!patient?.id) return;

    setLoading(true);
    setError('');

    return api
      .post<{ ssnMatch: boolean }>(Endpoints.IDENTITY_SSN_CHECK, {
        patientId: patient.id,
        ssn: last4,
      })
      .then(({ data }) => {
        if (data.ssnMatch) {
          nextPage();
        } else {
          nextPage('V_IDENTITY_Q3');
        }
      })
      .catch(() => nextPage('V_IDENTITY_Q3'));
  }, [api, last4, nextPage, patient?.id]);

  return (
    <Stack marginTop="-20px" gap="48px">
      <Typography>
        Don’t want to provide this?{' '}
        <Link
          onClick={() => nextPage('V_IDENTITY_Q3')}
          sx={{
            cursor: 'pointer',
          }}
        >
          Upload a photo of your ID instead
        </Link>
      </Typography>
      <TextField
        onChange={handleChange}
        value={last4}
        placeholder={'Last 4 digits of social security'}
        inputProps={{
          inputMode: 'numeric',
          pattern: '[0-9]*',
          maxLength: 4,
        }}
      />
      <Stack gap="16px">
        {error ? <ErrorMessage>{error}</ErrorMessage> : null}
        <LoadingButton
          fullWidth
          onClick={handleSubmit}
          loading={loading}
          disabled={loading}
        >
          Continue
        </LoadingButton>
      </Stack>
    </Stack>
  );
};

export default SSNVerification;
