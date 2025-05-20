import { usePatient } from '@/components/hooks/data';
import { PatientStatus } from '@/context/AppContext/reducers/types/patient';
import { Box, Stack, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import { useMemo } from 'react';

const steps = ['Create Account', 'Take Assessment', 'Start Care'] as const;

type StepType = 1 | 2 | 3 | 4;

const mapPatientStatusToStep: { [key in PatientStatus]: StepType } = {
  [PatientStatus.LEAD]: 1,
  [PatientStatus.PROFILE_CREATED]: 2,
  [PatientStatus.PAYMENT_SUBMITTED]: 3,
  [PatientStatus.ACTIVE]: 4,
  [PatientStatus.SUSPENDED]: 4,
};

const Bar = styled(Box)`
  line-height: 1;
  font-size: 11px;

  label {
    opacity: 0.8;
  }

  div {
    width: 144px;
    height: 8px;
    margin-top: 4px;
    border-radius: 4px;
  }

  @media (max-width: 600px) {
    font-size: 8px;

    div {
      width: 98px;
      height: 6px;
      border-radius: 3px;
    }
  }
`;

const ProgressBar = () => {
  const theme = useTheme();
  const { data: patient } = usePatient();

  const patientStatus = useMemo(
    () => patient?.status as PatientStatus,
    [patient?.status]
  );

  const current = useMemo(
    () => mapPatientStatusToStep[patientStatus],
    [patientStatus]
  );

  if (current === 4) return null;

  return (
    <Stack direction="row" spacing={1}>
      {steps.map((step, i) => (
        <Bar key={step}>
          <label>{step}</label>
          <div
            style={{
              backgroundColor:
                i < current - 1
                  ? theme.palette.primary.main
                  : i === current - 1
                  ? theme.palette.secondary.main
                  : '#EBEBEB',
            }}
          />
        </Bar>
      ))}
    </Stack>
  );
};

export default ProgressBar;
