import { PatientSubscriptionProps } from '@/components/hooks/data';
import { useRenewPrescription } from '@/components/hooks/mutations';
import { usePayment } from '@/components/hooks/usePayment';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { SUBSCRIPTIONS_STATUS } from '@/constants/subscriptions-status';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback } from 'react';
import { useQueryClient } from 'react-query';
import Stripe from 'stripe';

export interface PrescriptionRenewConfirmationModalProps {
  isOpen: boolean;
  prescription: PatientSubscriptionProps;
  onClose?: () => void;
  onRenew?: (data: Stripe.Subscription) => void | Promise<void>;
}

const PrescriptionRenewConfirmationModal = ({
  isOpen,
  onClose,
  onRenew,
  prescription,
}: PrescriptionRenewConfirmationModalProps) => {
  const { mutateAsync: renewPrescriptionMutation, isLoading } =
    useRenewPrescription();

  const { reactivateSubscription } = usePayment();
  const queryClient = useQueryClient();

  const handleRenewMedicationSubscription = useCallback(async () => {
    try {
      if (
        prescription?.status === SUBSCRIPTIONS_STATUS.SCHEDULED_FOR_CANCELLATION
      ) {
        const subscription = await reactivateSubscription(
          prescription.reference_id
        );
        onRenew?.(subscription.data);
      } else {
        const subscription = await renewPrescriptionMutation(prescription);
        onRenew?.(subscription);
      }
      onClose?.();
    } catch (error) {
      console.error(error);
    } finally {
      queryClient.invalidateQueries('allPatientMedicalSubscription');
      window.location.reload();
    }
  }, [
    onClose,
    onRenew,
    prescription,
    queryClient,
    reactivateSubscription,
    renewPrescriptionMutation,
  ]);

  return (
    <Modal open={isOpen}>
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
          minWidth: 350,
          maxWidth: 600,
          minHeight: 300,
          p: 4,
          outline: 'none',
          borderRadius: '8px',
          padding: '25px',
        }}
      >
        <Stack gap="24px">
          <Typography textAlign="center" variant="h2">
            Do you want to proceed with the renewal?
          </Typography>

          <Typography textAlign="center">
            {prescription.status ===
            SUBSCRIPTIONS_STATUS.SCHEDULED_FOR_CANCELLATION
              ? `Once you confirm below, your ${prescription?.care} subscription will
            no longer be scheduled for cancellation.`
              : `
            Once you confirm below, your ${prescription?.care} subscription will be renewed.
            `}
          </Typography>

          <Stack width="100%" gap="1rem">
            <LoadingButton
              loading={isLoading}
              fullWidth
              onClick={handleRenewMedicationSubscription}
            >
              Confirm
            </LoadingButton>
            <Button fullWidth variant="outlined" onClick={onClose}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Modal>
  );
};

export default PrescriptionRenewConfirmationModal;
