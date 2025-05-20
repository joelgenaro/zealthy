import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';

interface InformationModalProps {
  open: boolean;
  title: string;
  description: string;
  buttonText: string;
  buttonTextTwo: string;
  onClose: () => void;
  onJump: () => void;
}

const JumpAheadModal = ({
  open,
  title,
  description,
  buttonText,
  buttonTextTwo,
  onClose,
  onJump,
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
          bgcolor: '#FFFAF2',
          width: '46rem',
          minHeight: '50rem',
          p: 4,
          outline: 'none',
          borderRadius: '8px',
          paddingBottom: '5rem',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '35rem',
          }}
        >
          <Typography textAlign="center" variant="h2">
            {title}
          </Typography>
          <Typography
            textAlign={'center'}
            sx={{ marginTop: '3rem' }}
            variant="h2"
          >
            {description}
          </Typography>
        </Box>
        <Box sx={{ marginBottom: '5em' }} />
        <Button
          fullWidth
          onClick={onJump}
          sx={{ width: '30rem', borderRadius: '1rem' }}
        >
          {buttonText}
        </Button>
        <Box sx={{ marginBottom: '5em' }} />
        <Button
          sx={{
            border: '1px solid #00531B',
            background: '#FFFAF2',
            color: '#1B1B1B',
            width: '30rem',
            borderRadius: '1rem',
            '&:hover': {
              // Set hover styles to be the same as regular styles
              border: '1px solid #00531B',
              background: '#FFFAFA',
              color: '#1B1C1C',
            },
          }}
          onClick={onClose}
        >
          {buttonTextTwo}
        </Button>
      </Stack>
    </Modal>
  );
};

export { JumpAheadModal };
