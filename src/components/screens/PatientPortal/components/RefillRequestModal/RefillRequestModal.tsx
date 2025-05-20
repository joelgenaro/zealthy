import LoadingButton from '@/components/shared/Button/LoadingButton';
import {
  Box,
  Button,
  Modal,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Router from 'next/router';
import React, { useState } from 'react';
interface Props {
  open: boolean;
  hasPendingWeightLossRequest: boolean;
}

const RefillRequestModal = ({ open, hasPendingWeightLossRequest }: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [ignoreModal, setIgnoreModal] = useState<boolean>(false);

  const desktopSx = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.default',
    minWidth: 300,
    minHeight: 300,
    maxHeight: '100%',
    overflow: 'auto',
    p: 4,
    outline: 'none',
    borderRadius: 2,
    padding: '5%',
  };

  const mobileSx = {
    position: 'absolute',
    bgcolor: 'background.default',
    width: '100%',
    height: '100%',
    overflow: 'scroll',
    p: 4,
  };

  if (ignoreModal) {
    return null;
  }

  return (
    <Modal open={open}>
      <Box
        justifyContent="center"
        alignItems="center"
        sx={isMobile ? mobileSx : desktopSx}
      >
        <Stack
          gap={{ sm: '32px', xs: '24px' }}
          sx={
            isMobile
              ? {
                  position: 'relative',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }
              : {}
          }
        >
          <Stack gap={6} alignItems="center">
            <Typography variant="h2" textAlign="center">
              Complete your weight loss Rx refill
            </Typography>
            <Typography>
              To prevent any delays in medication coverage, it’s important to
              request a refill 1 week before your last dose.
            </Typography>
          </Stack>
          <Stack gap={2}>
            <LoadingButton
              fullWidth
              onClick={() =>
                Router.push(
                  hasPendingWeightLossRequest
                    ? '/patient-portal/visit/weight-loss-refill-error'
                    : '/patient-portal/visit/weight-loss-refill'
                )
              }
            >
              Complete Refill
            </LoadingButton>
            <Button
              fullWidth
              color="inherit"
              onClick={() => setIgnoreModal(true)}
            >
              Skip
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};

export default RefillRequestModal;
