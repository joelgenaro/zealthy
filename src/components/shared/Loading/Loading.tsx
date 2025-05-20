import { Box } from '@mui/material';
import Spinner, { SpinnerProps } from './Spinner';

const Loading = (props: SpinnerProps) => (
  <Box display="flex" justifyContent="center">
    <Spinner {...props} />
  </Box>
);

export default Loading;
