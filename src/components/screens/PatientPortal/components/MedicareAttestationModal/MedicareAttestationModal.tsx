import BasicModal from '@/components/shared/BasicModal';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import Loading from '@/components/shared/Loading/Loading';
import {
  Modal,
  Stack,
  Box,
  useTheme,
  useMediaQuery,
  Typography,
  Button,
} from '@mui/material';
import Router from 'next/router';
import React, { useState } from 'react';

interface ModalProps {
  open: boolean;
  submitRequest: () => void;
}

const MedicareAttestationModal = ({ open, submitRequest }: ModalProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  //   const [loading, setLoading] = useState(false);

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
          <Stack gap={2} alignItems="center">
            <Typography variant="h2" textAlign="center">
              You must confirm that you do not have Medicare / government
              insurance before purchase. This includes any Medicare plan that is
              administered by other insurance companies.
            </Typography>
            <Typography>
              If you have Medicare in any form, your order will be cancelled
              immediately. Do not continue to purchase if you are a Medicare
              recipient.
            </Typography>
          </Stack>
          <Stack gap={2}>
            <Button fullWidth onClick={submitRequest}>
              Proceed to purchase - I am not on Medicare
            </Button>
            <LoadingButton
              //   loading={loading}
              //   disabled={loading}
              fullWidth
              color="grey"
              onClick={() => Router.push('/patient-portal')}
            >
              Cancel
            </LoadingButton>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};

export default MedicareAttestationModal;
