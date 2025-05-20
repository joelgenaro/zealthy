import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface InformationModalProps {
  open: boolean;
  title: string;
  description: string;
  buttonText: string;
  onClose: () => void;
  onConfirm: () => void;
}

const InformationModal = ({
  open,
  title,
  description,
  buttonText,
  onClose,
  onConfirm,
}: InformationModalProps) => {
  return (
    <Modal open={open} onClose={onClose}>
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
          padding: '25px',
        }}
      >
        <Typography textAlign="center" variant="h2">
          {title}
        </Typography>
        <Typography textAlign={'center'}>{description}</Typography>
        <Button fullWidth onClick={onConfirm}>
          {buttonText}
        </Button>
      </Stack>
    </Modal>
  );
};

export default InformationModal;
