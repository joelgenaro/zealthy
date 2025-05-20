import { usePatient } from '@/components/hooks/data';
import { useUpdateDefaultPaymentMethod } from '@/components/hooks/mutations';
import { usePayment } from '@/components/hooks/usePayment';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useCallback, useEffect, useState } from 'react';
import LoadingButton from '../Button/LoadingButton';
import ErrorMessage from '../ErrorMessage';
import WhiteBox from '../layout/WhiteBox';

interface PaymentEditModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  handlePrescriptionRequest?: () => void;
  setOpenUpdatePayment?: any;
  handlePayAllInvoices?: () => void;
}

const PaymentEditModal = ({
  open,
  title,
  onClose,
  handlePrescriptionRequest = () => {},
  setOpenUpdatePayment = () => {},
  handlePayAllInvoices = () => {},
}: PaymentEditModalProps) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { data: patient } = usePatient();
  const { createSetupIntent } = usePayment();
  const updatePaymentMethod = useUpdateDefaultPaymentMethod();
  const elements = useElements();
  const stripe = useStripe();

  const onSuccess = useCallback(
    async (paymentMethodId: string) => {
      return updatePaymentMethod
        .mutateAsync({
          paymentMethodId: paymentMethodId,
        })
        .then(() => {
          setLoading(false);
          onClose();
        })
        .catch(e => {
          setError(e.response.data.message);
          setLoading(false);
        });
    },
    [onClose, updatePaymentMethod]
  );

  const handleSetupIntent = useCallback(
    async (clientSecret: string, payment_method: string) => {
      const result = await stripe!.confirmCardSetup(clientSecret, {
        payment_method,
      });

      if (result.error) {
        setError(
          result.error.message || 'Something went wrong, Please try again'
        );
        setLoading(false);
        return;
      }

      // The payment has been processed!
      if (result.setupIntent.status === 'succeeded') {
        await onSuccess(payment_method);
      }

      setLoading(false);
      return;
    },
    [onSuccess, stripe]
  );

  const handleConfirmation = useCallback(async () => {
    if (!elements || !stripe || !patient) return;

    setError('');
    setLoading(true);

    const result = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement)!,
    });

    if (result.error) {
      setError(
        result.error.message || 'Something went wrong. Please try again'
      );
      setLoading(false);
      return;
    }

    //create setup intent
    const { data, error } = await createSetupIntent(patient.id);

    if (error) {
      setError('Error updating your card. Please try again.');
      setLoading(false);
      return;
    }

    // handle setup intent
    await handleSetupIntent(data!.client_secret, result.paymentMethod.id)
      .then(() => {
        setOpenUpdatePayment(false);
      })
      .then(() => {
        handlePayAllInvoices();
      })
      .then(() => {
        handlePrescriptionRequest();
      });
  }, [createSetupIntent, elements, handleSetupIntent, patient, stripe]);

  useEffect(() => {
    if (open) {
      setError('');
      setLoading(false);
    }
  }, [open]);

  return (
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
          minWidth: 350,
          minHeight: 350,
          p: 4,
          outline: 'none',
          borderRadius: '8px',
          padding: '25px',
        }}
      >
        <Typography textAlign="center" variant="h2">
          {title}
        </Typography>

        <WhiteBox padding="24px">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  '::placeholder': {
                    color: '#1B1B1B',
                  },
                },
              },
            }}
          />
        </WhiteBox>

        {error ? <ErrorMessage>{error}</ErrorMessage> : null}

        <Stack width="100%" gap="1rem">
          <LoadingButton
            loading={loading}
            fullWidth
            onClick={handleConfirmation}
          >
            Update
          </LoadingButton>
          <Button fullWidth variant="outlined" onClick={onClose}>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
};

export default PaymentEditModal;
