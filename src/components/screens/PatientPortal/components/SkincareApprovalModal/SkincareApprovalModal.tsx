import { usePatientOrders } from '@/components/hooks/data';
import { OrderProps } from '@/components/screens/Prescriptions/OrderHistoryContent';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import {
  Modal,
  Stack,
  useMediaQuery,
  useTheme,
  Box,
  Typography,
  Button,
} from '@mui/material';
import Router from 'next/router';
import React, { useEffect, useState } from 'react';

interface ModalProps {
  open: any;
  handleOpen: (m: boolean) => void;
  order: OrderProps;
}

const SkincareApprovalModal = ({ open, handleOpen, order }: ModalProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: orders } = usePatientOrders();
  const [ignoreModal, setIgnoreModal] = useState(false);

  //   const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order) {
      handleOpen(true);
    }
  }, [order]);

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
          <Stack gap={2} alignItems="center">
            <Typography variant="h2" textAlign="center">
              Your skincare treatment plan is ready
            </Typography>
            <Typography>
              Complete the checkout process to receive your customized treatment
              plan delivered to your door
            </Typography>
          </Stack>
          <Stack gap={2}>
            <Button
              fullWidth
              onClick={() =>
                Router.push(
                  `/patient-portal/complete/skincare-approval/${order?.id}`
                )
              }
            >
              Complete checkout
            </Button>
            <LoadingButton
              //   loading={loading}
              //   disabled={loading}
              fullWidth
              color="grey"
              onClick={() => setIgnoreModal(true)}
            >
              Ignore for now
            </LoadingButton>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};

export default SkincareApprovalModal;
