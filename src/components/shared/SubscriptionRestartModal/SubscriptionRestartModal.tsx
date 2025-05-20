import { Medication } from '@/context/AppContext/reducers/types/visit';
import { capitalize } from '@/utils/capitalize';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useMemo, useState } from 'react';
import LoadingButton from '../Button/LoadingButton';
import ErrorMessage from '../ErrorMessage';

interface SubscriptionRestartModalProps {
  open: boolean;
  title: string;
  titleOnSuccess: string;
  description: string[];
  onConfirm: () => Promise<void>;
  onClose: () => void;
  buttonText: string;
  medication?: Medication;
  price?: number;
}

const SubscriptionRestartModal = ({
  open,
  title,
  titleOnSuccess,
  description,
  onConfirm,
  onClose,
  buttonText,
  medication,
  price,
}: SubscriptionRestartModalProps) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    setStatus('idle');
    setError('');
  }, [open]);

  const handleConfirmation = useCallback(async () => {
    try {
      setLoading(true);
      await onConfirm();
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setError(
        (error as Error).message || 'Something went wrong. Please try again'
      );
    } finally {
      setLoading(false);
    }
  }, [onConfirm]);

  const frequency = useMemo(() => {
    if (!medication) return '';

    if (medication.recurring.interval_count === 1) {
      return `${capitalize(medication.recurring.interval)}ly`;
    }

    return `Every ${medication.recurring.interval_count} ${medication.recurring.interval}`;
  }, [medication]);

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
          maxWidth: 600,
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
              {title}
            </Typography>

            {description.map(d => (
              <Typography key={d} textAlign={'center'}>
                {d}
              </Typography>
            ))}

            {medication ? (
              <Stack alignItems="center" gap="8px">
                <Typography>Price: ${price || medication.price}</Typography>
                <Typography textAlign="center">
                  Dosage: {medication.dosage}
                </Typography>
                <Typography>Frequency: {frequency}</Typography>
              </Stack>
            ) : null}

            <Stack width="100%" gap="1rem">
              <LoadingButton
                loading={loading}
                fullWidth
                onClick={handleConfirmation}
              >
                {buttonText}
              </LoadingButton>
              <Button fullWidth variant="outlined" onClick={onClose}>
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

        {status === 'success' && (
          <>
            <Typography textAlign="center" variant="h2">
              {titleOnSuccess}
            </Typography>
            <Button fullWidth variant="outlined" onClick={onClose}>
              Ok
            </Button>
          </>
        )}
      </Stack>
    </Modal>
  );
};

export default SubscriptionRestartModal;
