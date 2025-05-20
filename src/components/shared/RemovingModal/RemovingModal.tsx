import { Modal, Stack, Typography, Button } from '@mui/material';

interface Props {
  title?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onClose: () => void;
  onRemove: () => void;
}

const RemovingModal = ({
  onClose,
  onRemove,
  title = 'Are you sure you want to remove this item?',
  confirmButtonText = 'Remove',
  cancelButtonText = 'Go back',
}: Props) => (
  <Modal open>
    <Stack
      justifyContent="center"
      alignItems="center"
      spacing={2}
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
      <Typography variant="h3">{title}</Typography>
      <Button
        style={{ padding: '10px' }}
        fullWidth
        variant="outlined"
        onClick={onClose}
      >
        {cancelButtonText}
      </Button>
      <Button style={{ padding: '10px' }} fullWidth onClick={onRemove}>
        {confirmButtonText}
      </Button>
    </Stack>
  </Modal>
);

export default RemovingModal;
