import { useILV } from '@/context/ILVContextProvider';
import { Pathnames } from '@/types/pathnames';
import { Button, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import Router from 'next/router';
import { useCallback } from 'react';
import { StandardModal } from '../../modals';

interface CancelILVRequestProps {
  open: boolean;
  setOpen: (b: boolean) => void;
  count: number;
}

const CancelILVRequest = ({ open, setOpen, count }: CancelILVRequestProps) => {
  const { request, cancelRequest } = useILV();
  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const cancelAndClose = useCallback(() => {
    if (request) {
      cancelRequest(request).then(handleClose);
    }
  }, [cancelRequest, handleClose, request]);

  const scheduleInstead = useCallback(async () => {
    if (!request) return;

    Router.push(
      `${Pathnames.PATIENT_PORTAL}/visit/schedule-visit?appointment=${request.id}`
    ).then(handleClose);
  }, [handleClose, request]);

  return (
    <StandardModal setModalOpen={setOpen} modalOpen={open}>
      <Stack gap="16px" marginTop="24px">
        <Typography textAlign="center" fontWeight={600}>
          Would you like to keep your spot in line? Your estimated wait time is{' '}
          {count} minutes. You’ll receive a text and an email with the visit
          link. We recommend that you stay in the Zealthy portal to avoid
          missing any communications about your video visit.
        </Typography>
        <Button onClick={handleClose}>
          Continue and keep your spot in line
        </Button>
        <Button color="grey" onClick={scheduleInstead}>
          Schedule a visit instead
        </Button>
        <Button variant="text" onClick={cancelAndClose}>
          Cancel visit request
        </Button>
      </Stack>
    </StandardModal>
  );
};

export default CancelILVRequest;
