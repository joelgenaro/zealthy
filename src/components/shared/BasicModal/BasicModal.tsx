import { ReactNode, useState } from 'react';
import { Box, Stack, Modal, useMediaQuery, useTheme } from '@mui/material';
import Logo from '@/components/shared/icons/Logo';

interface Props {
  isOpen: boolean;
  children?: ReactNode;
  useMobileStyle?: boolean;
  onClose?: () => void;
}

const BasicModal = ({
  isOpen,
  children,
  onClose,
  useMobileStyle = true,
}: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setIsOpen] = useState(true);

  const desktopSx = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.default',
    maxWidth: 500,
    minWidth: 300,
    minHeight: 300,
    maxHeight: '100%',
    overflow: 'auto',
    p: 4,
    outline: 'none',
  };

  const mobileSx = {
    position: 'absolute',
    bgcolor: 'background.default',
    width: '100%',
    height: '100%',
    overflow: 'scroll',
    p: 4,
  };

  return (
    <Modal open={isOpen && open} onClose={onClose}>
      <Box
        justifyContent="center"
        alignItems="center"
        borderRadius={2}
        sx={isMobile && useMobileStyle ? mobileSx : desktopSx}
      >
        <Stack gap={{ sm: '32px', xs: '24px' }}>
          {isMobile && useMobileStyle && (
            <Box
              sx={{
                color: 'inherit',
                alignSelf: 'center',
                marginBottom: '2rem',
              }}
            >
              <Logo />
            </Box>
          )}
          {children}
        </Stack>
      </Box>
    </Modal>
  );
};

export default BasicModal;
