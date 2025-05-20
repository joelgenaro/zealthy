import { Box, Stack, useTheme } from '@mui/material';
import { styled } from '@mui/system';

const steps = ['Processing stopped', ' ', ' '] as const;

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
interface StoppedStatusBarProps {
  isDenied?: boolean;
}

const StoppedStatusBar = ({ isDenied }: StoppedStatusBarProps) => {
  const theme = useTheme();

  const current = isDenied ? 4 : 1;

  return (
    <Stack direction="row" spacing={1} width="100%" alignItems="end">
      {steps.map((step, i) => (
        <Bar key={'step-' + i}>
          <label>{step}</label>
          <div
            style={{
              backgroundColor:
                i < current - 1
                  ? theme.palette.error.main
                  : i === current - 1
                  ? theme.palette.error.light
                  : '#EBEBEB',
            }}
          />
        </Bar>
      ))}
    </Stack>
  );
};

export default StoppedStatusBar;
