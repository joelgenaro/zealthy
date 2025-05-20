import { Close } from '@mui/icons-material';
import { Box, IconButton, Modal, Stack } from '@mui/material';

type ModalProps = {
  children: any;
  setModalOpen: (m: any) => void;
  modalOpen: boolean;
  bgColor?: string;
  maxWidth?: string;
  maxHeight?: string;
  showCloseIcon?: boolean;
};
export const StandardModal = ({
  children,
  setModalOpen,
  modalOpen,
  bgColor = 'white',
  maxWidth = '476px',
  maxHeight = '70%',
  showCloseIcon = true,
}: ModalProps) => {
  return (
    <Modal
      onClose={() => setModalOpen((m: any) => !m)}
      open={modalOpen}
      disableAutoFocus
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          backgroundColor: bgColor,
          px: 4,
          py: 4,
          borderRadius: 2,
          maxWidth,
          width: 'calc(100% - 2rem)',
          overflowY: 'auto',
          maxHeight,
        }}
      >
        {showCloseIcon && (
          <IconButton
            onClick={() => setModalOpen((m: any) => !m)}
            sx={{ position: 'absolute', top: 20, right: 20 }}
          >
            <Close />
          </IconButton>
        )}

        <Stack gap={4} alignItems="center">
          {children}
        </Stack>
      </Box>
    </Modal>
  );
};
