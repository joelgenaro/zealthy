import { OrderStatus } from '@/types/orderStatus';
import { Box, Stack, useTheme } from '@mui/material';
import { styled } from '@mui/system';

const steps = ['Processing', 'Shipped'] as const;

type StepType = 0 | 1 | 2 | 3;

const mapStatusToStep: { [key: string]: StepType } = {
  [OrderStatus.PROCESSING]: 1,
  [OrderStatus.SHIPPED]: 3,
  [OrderStatus.OUT_FOR_DELIVERY]: 3,
  [OrderStatus.DELIVERED]: 3,
  [OrderStatus.COMPLETE]: 3,
  [OrderStatus.CANCELED]: 0,
  [OrderStatus.SENT_TO_LOCAL_PHARMACY]: 0,
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

const StatusBar = ({ status }: { status: OrderStatus }) => {
  const theme = useTheme();

  const current = mapStatusToStep[status];

  if (current === 0) return null;

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
