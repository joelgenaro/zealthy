import { useState } from 'react';
import {
  Box,
  Stack,
  Modal,
  Typography,
  useMediaQuery,
  useTheme,
  Button,
  Fade,
} from '@mui/material';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';

interface WeightLossRedirectPopupProps {
  isOpen: boolean;
}

const desktopSx = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.default',
  width: '60%',
  height: 'auto',
  overflow: 'auto',
  p: 4,
  outline: 'none',
  borderRadius: 2,
};

const mobileSx = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.default',
  width: '90%',
  height: 'auto',
  p: 4,
  outline: 'none',
  borderRadius: 2,
};

const WeightLossRedirectPopup = ({ isOpen }: WeightLossRedirectPopupProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setIsOpen] = useState(true);

  const handleClose = () => {
    sessionStorage.removeItem('showWlRedirectPopup');
    setIsOpen(false);
    Router.push(Pathnames.PATIENT_PORTAL);
  };

  return (
    <Modal
      open={isOpen && open}
      onClose={handleClose}
      closeAfterTransition
      aria-labelledby="weight-loss-redirect-popup-title"
      aria-describedby="weight-loss-redirect-popup-description"
    >
      <Fade in={isOpen && open}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={isMobile ? mobileSx : desktopSx}
        >
          <Stack alignItems="center" spacing={3} sx={{ width: '80%' }}>
            <Typography
              variant="h2"
              textAlign="center"
              id="weight-loss-redirect-popup-description"
            >
              You are already an active member of a weight loss program at
              Zealthy.
            </Typography>
            <Button
              variant="contained"
              sx={{ width: '100%' }}
              onClick={() =>
                Router.push('/patient-portal/visit/weight-loss-refill')
              }
            >
              Request a refill
            </Button>
            <Button
              variant="contained"
              sx={{ width: '100%' }}
              color="grey"
              onClick={() =>
                Router.push(`${Pathnames.MESSAGES}?complete=weight-loss`)
              }
            >
              Message your care team
            </Button>
            <Button
              size="small"
              variant="text"
              fullWidth
              onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}
            >
              Go back to your Zealthy portal
            </Button>
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );
};

export default WeightLossRedirectPopup;
