import { Database } from '@/lib/database.types';
import { Button, Stack } from '@mui/material';
import { useCallback, useState } from 'react';
import ILVWarningModal from '../ILVWarningModal';
import ILVMessages from './components/ILVMessages';
import LoadingButton from '../Button/LoadingButton';
import { StandardModal } from '../modals';

type Appointment = Database['public']['Tables']['appointment']['Row'];

interface ILVModalProps {
  open: boolean;
  setOpen: (b: boolean) => void;
  request: Appointment;
  onLeave: (r: Appointment) => Promise<void>;
  onNext: () => void;
}

const ILVModal = ({
  open,
  setOpen,
  request,
  onLeave,
  onNext,
}: ILVModalProps) => {
  const [loading, setLoading] = useState(false);
  const [openConfirmation, setOpenConfirmation] = useState(false);

  const cancelRequest = useCallback(() => {
    return onLeave(request);
  }, [onLeave, request]);

  const cancelAndGoToNextPage = useCallback(async () => {
    setLoading(true);
    return onLeave(request);
  }, [onLeave, request]);

  const handleExit = useCallback(async () => {
    return cancelRequest().then(() => {
      setOpen(false);
    });
  }, [cancelRequest, setOpen]);

  return (
    <>
      <StandardModal setModalOpen={setOpen} modalOpen={open} maxHeight="100%">
        <Stack
          paddingTop="20px"
          width="100%"
          alignItems="center"
          sx={{ cursor: 'pointer' }}
          gap="16px"
        >
          <ILVMessages
            onLeave={cancelAndGoToNextPage}
            message="Your provider will be with you soon. Your estimated wait time is {{TIME}} minutes. You’ll receive a text and an email with the visit link. We recommend that you stay in the Zealthy portal to avoid missing any communications about your video visit."
            showSubtext={false}
          />

          <Button onClick={onNext}>
            {'Continue and keep your spot in line'}
          </Button>
          <LoadingButton
            color="error"
            onClick={cancelAndGoToNextPage}
            loading={loading}
            disabled={loading}
          >
            Cancel visit request
          </LoadingButton>
        </Stack>
      </StandardModal>
      <ILVWarningModal
        open={openConfirmation}
        setOpen={setOpenConfirmation}
        onConfirm={handleExit}
      />
    </>
  );
};

export default ILVModal;
