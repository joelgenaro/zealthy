import {
  useLiveVisitAvailability,
  Appointment,
  usePatientAppointments,
} from '@/components/hooks/data';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { StandardModal } from '@/components/shared/modals';
import { useILV } from '@/context/ILVContextProvider';
import availability from '@/pages/api/service/treat-me-now/availability';
import { Pathnames } from '@/types/pathnames';
import { Button, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { Router } from 'next/router';
import { useState, useCallback, useEffect } from 'react';

interface TreatmentILVModalProps {
  open: boolean;
  setOpen: (val: boolean) => void;
}

export const TreatmentILVModal = ({
  open,
  setOpen,
}: TreatmentILVModalProps) => {
  const [loading, setLoading] = useState(false);
  const { data: availability } = useLiveVisitAvailability();
  const { request, requestILV, cancelRequest } = useILV();
  const { data: patientAppointments } = usePatientAppointments();
  const [hasOpenedModal, setHasOpenedModal] = useState<boolean>(false);
  const [hasClosedModal, setHasClosedModal] = useState<boolean>(false);

  const createRequest = useCallback(async () => {
    setLoading(true);
    requestILV().then(() => {
      setLoading(false);
    });
  }, [requestILV]);

  useEffect(() => {
    if (open) {
      setHasOpenedModal(true);
    }
  }, [open]);

  useEffect(() => {
    if (!open && hasOpenedModal) {
      setHasClosedModal(true);
    }
  }, [open, hasOpenedModal]);

  if (hasOpenedModal && hasClosedModal) {
    return <></>;
  }

  if (request || !availability?.available) {
    return <></>;
  }

  if (
    patientAppointments?.filter((appointment: Appointment) => {
      return (
        appointment.encounter_type === 'Walked-in' &&
        appointment.status === 'Completed'
      );
    })?.length! > 0
  ) {
    return <></>;
  }

  return (
    <StandardModal
      maxHeight="100%"
      modalOpen={open}
      setModalOpen={setOpen}
      showCloseIcon={false}
    >
      <Typography variant="h2" textAlign="center">
        If you’d like to talk to a medical provider live before ordering, select
        “Complete video visit” below
      </Typography>
      <Stack
        borderRadius="12px"
        border="1px solid #535353"
        padding="24px 48px"
        gap="32px"
        alignItems="center"
        position="relative"
      >
        <Typography
          position="absolute"
          bgcolor="#00531B"
          borderRadius="12px"
          padding={'2px 16px'}
          color="white"
          fontWeight={600}
          top="-12px"
          left="12px"
        >
          Most popular
        </Typography>
        <Typography variant="h3">Meet with a provider via video now</Typography>
        <Typography textAlign="center">
          Click below to talk with a provider now. This is a video visit with a
          medical provider, so if you have questions about billing, shipping
          statuses, or other inquiries unrelated to your medical care, call us
          at (877) 870-0323 instead.
        </Typography>
        <LoadingButton
          loading={loading}
          onClick={createRequest}
          sx={{ maxWidth: '400px' }}
          disabled={loading}
        >
          Complete video visit
        </LoadingButton>
        {availability?.estimatedWaitTime ? (
          <Typography>{`Current Estimated Wait Time: ${availability.estimatedWaitTime} Min`}</Typography>
        ) : null}
      </Stack>
      <Button
        onClick={() => setOpen(!open)}
        sx={{ width: '200px', backgroundColor: 'gray' }}
      >
        Not right now
      </Button>
    </StandardModal>
  );
};
