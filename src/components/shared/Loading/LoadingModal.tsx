import { Modal, Stack, Typography } from '@mui/material';
import Spinner from './Spinner';

interface Props {
  title?: string;
  description?: string;
}

const LoadingModal = ({ title, description }: Props) => (
  <Modal open>
    <Stack
      justifyContent="center"
      alignItems="center"
      spacing={6}
      borderRadius="10px"
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.default',
        minWidth: 300,
        minHeight: 300,
        p: 4,
        outline: 'none',
      }}
    >
      {title && <Typography fontSize={12}>{title}</Typography>}
      <Spinner />
      {description && (
        <Typography fontSize={11} sx={{ opacity: 0.5 }}>
          {description}
        </Typography>
      )}
    </Stack>
  </Modal>
);

export default LoadingModal;
