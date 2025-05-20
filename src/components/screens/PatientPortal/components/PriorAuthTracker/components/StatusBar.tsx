import { PriorAuthStatus } from '@/types/priorAuthStatus';
import { Box, Stack, useTheme } from '@mui/material';
import { styled } from '@mui/system';

const steps = [
  'Processing',
  'Submitted by Zealthy',
  'Response Received',
] as const;

type StepType = -1 | 0 | 1 | 2 | 3 | 4;

const mapStatusToStep: { [key: string]: StepType } = {
  [PriorAuthStatus.PENDING_INSURANCE]: 0,
  [PriorAuthStatus.PENDING_MEDICAL]: 0,
  [PriorAuthStatus.PROCESSING]: 1,
  [PriorAuthStatus.SUBMITTED]: 2,
  [PriorAuthStatus.APPROVED_WITH_PHARMACY_BENEFITS]: 4,
  [PriorAuthStatus.APPROVED]: 4,
  [PriorAuthStatus.DENIED]: 4,
};

const Bar = styled(Box)`
  line-height: 1;
  width: 100%;

  label {
    opacity: 0.8;
    font-size: 10px;
  }

  div {
    width: 100%;
    height: 8px;
    margin-top: 4px;
    border-radius: 4px;
  }
`;

const StatusBar = ({ status }: { status: PriorAuthStatus }) => {
  const theme = useTheme();

  const current = mapStatusToStep[status];

  if (current === -1) return null;

  return (
    <Stack direction="row" spacing={1} width="100%" alignItems="end">
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

export default StatusBar;
