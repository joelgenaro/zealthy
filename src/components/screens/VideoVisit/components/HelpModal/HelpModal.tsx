import { Appointment, PatientProps } from '@/components/hooks/data';
import { useAppointmentAsync } from '@/components/hooks/useAppointment';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import CloseIcon from '@/components/shared/icons/CloseIcon';
import { supabaseClient } from '@/lib/supabaseClient';
import {
  Box,
  Button,
  IconButton,
  Modal,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Router from 'next/router';
import React, { useState } from 'react';

interface ModalProps {
  open: boolean;
  onClose: (m: boolean) => void;
  appointment: any;
  patient: PatientProps | undefined;
  appointmentInfo: any;
}

const HelpModal = ({
  open,
  onClose,
  appointment,
  patient,
  appointmentInfo,
}: ModalProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { updateAppointment } = useAppointmentAsync();
  const [canceling, setCanceling] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
  };

  const mobileSx = {
    position: 'absolute',
    bgcolor: 'background.default',
    width: '100%',
    height: '100%',
    overflow: 'scroll',
    p: 4,
  };

  const handleReschduleVisit = async () => {
    try {
      setIsLoading(true);
      await supabaseClient
        .from('task_queue')
        .update({ visible: false })
        .eq('id', appointmentInfo?.queue_id);
      Router.push(
        `/schedule-appointment?id=${appointmentInfo?.clinician_id}&appt-id=${appointment}`
      );
    } catch (e) {
      throw new Error();
    }
    {
      setIsLoading(false);
    }
  };

  const handleCancelVisit = async () => {
    try {
      setCanceling(true);
      await updateAppointment(
        appointment,
        {
          status: 'Provider-Noshowed',
        },
        patient!
      );
      await supabaseClient
        .from('task_queue')
        .update({ visible: false })
        .eq('id', appointmentInfo?.queue_id);
      Router.push('/patient-portal');
    } catch (e) {
      throw new Error();
    } finally {
      setCanceling(false);
    }
  };

  return (
    <Modal open={open}>
      <Box
        justifyContent="center"
        alignItems="center"
        borderRadius={2}
        sx={isMobile ? mobileSx : desktopSx}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={() => onClose(!open)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <br />
        <Typography variant="h3">
          Would you like to reschedule your visit for another time?
        </Typography>
        <br />
        <Stack gap={2} sx={{ marginTop: '23px' }}>
          <LoadingButton onClick={handleReschduleVisit} loading={isLoading}>
            Yes, my provider did not show up
          </LoadingButton>
          <LoadingButton
            loading={canceling}
            sx={{ backgroundColor: '#AAA' }}
            onClick={handleCancelVisit}
          >
            No, my provider did not show up and I want to cancel my visit
          </LoadingButton>
        </Stack>
      </Box>
    </Modal>
  );
};

export default HelpModal;
