import LoadingButton from '@/components/shared/Button/LoadingButton';
import { allOptionsColoradoEvent } from '@/utils/freshpaint/events';
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

interface PatientInfo {
  patientFirstName: string;
  patientLastName: string;
  patientEmail: string;
}

const ViewMoreDosagesModal = ({
  patientFirstName,
  patientLastName,
  patientEmail,
}: PatientInfo) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const desktopSx = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.default',
    minWidth: 300,
    minHeight: 300,
    maxHeight: '90%',
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
          <Stack alignItems="center">
            <Typography variant="h2" textAlign="center">
              It looks like you’re still considering semaglutide or tirzepatide
              but haven’t purchased yet - you can view more dosage and pricing
              options if you’d like
            </Typography>
            <br></br>
            <Typography variant="body1">
              We recommend titrating up to a higher dose to ensure you’re
              continuing to safely lose weight. If you would prefer to stay at
              your current dosage level or at a lower dosage level then you may
              do so using the “Choose my next order” button.
            </Typography>
          </Stack>
          <Stack gap={2}>
            <Button
              fullWidth
              onClick={() => {
                Router.push('/patient-portal/visit/weight-loss-refill');
                allOptionsColoradoEvent(
                  patientEmail,
                  patientFirstName,
                  patientLastName
                );
              }}
            >
              Choose my next order
            </Button>
            <LoadingButton
              loading={loading}
              disabled={loading}
              fullWidth
              color="grey"
              onClick={() => setOpen(false)}
            >
              Review later
            </LoadingButton>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};

export default ViewMoreDosagesModal;
