import { AppointmentState } from '@/context/AppContext/reducers/types/appointment';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useState } from 'react';
import LoadingButton from '../Button/LoadingButton';
import VisitSummary from '../VisitSummary';

interface AppointmentConfirmationModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  appointment: AppointmentState;
  onConfirm: () => Promise<void>;
}

const AppointmentConfirmationModal = ({
  title,
  open,
  onClose,
  appointment,
  onConfirm,
}: AppointmentConfirmationModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleConfirmation = useCallback(async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  }, [onConfirm]);

  return (
    <Modal open={open}>
      <Stack
        justifyContent="center"
        alignItems="center"
        spacing={3}
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
          borderRadius: '8px',
        }}
      >
        <Typography variant="h4">{title}</Typography>
        <VisitSummary appointment={appointment!} />
        <Stack width="100%" gap="1rem">
          <LoadingButton
            loading={loading}
            fullWidth
            onClick={handleConfirmation}
          >
            Confirm
          </LoadingButton>
          <Button fullWidth color="grey" onClick={onClose}>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
};

export default AppointmentConfirmationModal;
