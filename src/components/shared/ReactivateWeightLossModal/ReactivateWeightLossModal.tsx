import {
  useAllVisiblePatientSubscription,
  usePatient,
} from '@/components/hooks/data';
import { useReactivateSubscription } from '@/components/hooks/mutations';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useMemo, useState } from 'react';
import LoadingButton from '../Button/LoadingButton';
import ErrorMessage from '../ErrorMessage';
import PaymentEditModal from '../PaymentEditModal';

interface ReactivateWeightLossModalProps {
  open: boolean;
  onClose: () => void;
}

const ReactivateWeightLossModal = ({
  open,
  onClose,
}: ReactivateWeightLossModalProps) => {
  const reactivateSubscription = useReactivateSubscription();
  const { data: patient } = usePatient();
  const { data: patientSubscriptions = [], refetch } =
    useAllVisiblePatientSubscription();

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<
    'idle' | 'success' | 'error' | 'payment-error'
  >('idle');
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const wlSub = useMemo(() => {
    return patientSubscriptions.find(
      s =>
        s.subscription.name.toLowerCase().includes('weight loss') &&
        ['scheduled_for_cancelation'].includes(s.status)
    );
  }, [patientSubscriptions]);

  useEffect(() => {
    setStatus('idle');
    setError('');
  }, [open]);

  const handleConfirmation = useCallback(async () => {
    try {
      setLoading(true);
      const reactivate = await reactivateSubscription.mutateAsync(
        wlSub?.reference_id!
      );

      if (reactivate) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
      setError(
        (error as Error).message || 'Something went wrong. Please try again'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <Modal open={open}>
        <Stack
          justifyContent="center"
          alignItems="center"
          spacing={3}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.default',
            minWidth: 300,
            minHeight: 300,
            p: 4,
            outline: 'none',
            borderRadius: '8px',
            padding: '25px',
          }}
        >
          {status === 'idle' && (
            <Stack gap="24px">
              <Typography textAlign="center" variant="h2">
                Reactivate your weight loss membership to order medication?
              </Typography>
              <Typography textAlign="center" variant="body1">
                In order to order medication, you need to have an active Weight
                Loss membership that is not scheduled for cancellation within
                the next month, since this will allow your provider to monitor
                your care during the entire period of taking your medication.
                <br /> <br />
                Once you confirm below, your Zealthy Weight Loss subscription
                will no longer be scheduled for cancellation. You will also be
                confirming your order for your prescribed GLP-1 medication,
                which should then arrive at your address in the coming days.
              </Typography>
              <Stack width="100%" gap="1rem">
                <LoadingButton
                  size="small"
                  loading={loading}
                  fullWidth
                  onClick={handleConfirmation}
                >
                  Yes, reactivate
                </LoadingButton>
                <Button
                  size="small"
                  fullWidth
                  variant="outlined"
                  onClick={onClose}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          )}

          {status === 'error' && (
            <>
              <ErrorMessage>{error}</ErrorMessage>
              <Stack width="100%" gap="1rem">
                <LoadingButton
                  loading={loading}
                  fullWidth
                  onClick={handleConfirmation}
                >
                  Try again
                </LoadingButton>
                <Button fullWidth variant="outlined" onClick={onClose}>
                  Cancel
                </Button>
              </Stack>
            </>
          )}

          {status === 'payment-error' && (
            <>
              <Typography variant="h3" textAlign="center">
                {error}
              </Typography>
              <Stack width="100%" gap="1rem">
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setShowPaymentModal(true)}
                >
                  Update payment
                </Button>
              </Stack>
            </>
          )}

          {status === 'success' && (
            <>
              <Typography textAlign="center" variant="h2">
                Your weight loss subscription has been reactivated and your
                GLP-1 medication has been ordered.
              </Typography>
              <Button fullWidth variant="outlined" onClick={onClose}>
                Ok
              </Button>
            </>
          )}
        </Stack>
      </Modal>
      <PaymentEditModal
        open={showPaymentModal}
        title="Update your card to get your care or prescription"
        onClose={() => {
          setShowPaymentModal(false);
          setStatus('idle');
        }}
      />
    </>
  );
};

export default ReactivateWeightLossModal;
