import { useCallback, useEffect, useState } from 'react';
import { Box, Button, Modal, Stack, Typography } from '@mui/material';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useRouter } from 'next/router';
import { useWeightLossSubscription } from '@/components/hooks/data';
import LoadingButton from '../Button/LoadingButton';
import ErrorMessage from '../ErrorMessage';

interface ReactivateSubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const ReactivateSubscriptionModal = ({
  open,
  onClose,
  onConfirm,
}: ReactivateSubscriptionModalProps) => {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const { data: weightLossSubscriptions } = useWeightLossSubscription();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const styles = isMobile
    ? {
        position: 'absolute',
        backgroundColor: '#FFFAF2',
        height: 'auto',
        width: 'auto',
        right: 'auto',
        transition: 'none',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        minWidth: 300,
        minHeight: 200,
        maxHeight: '90%',
        borderRadius: 5,
        padding: '25px',
      }
    : {
        position: 'absolute',
        backgroundColor: '#FFFAF2',
        height: 'auto',
        width: 'auto',
        right: 'auto',
        transition: 'none',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        minWidth: 500,
        minHeight: 300,
        maxHeight: '90%',
        borderRadius: 5,
        padding: '25px',
      };

  useEffect(() => {
    setRefresh(!refresh);
    if (open) {
      setShow(true);
    }
  }, [open, router]);

  useEffect(() => {
    setStatus('idle');
    setError('');
  }, [open]);

  const handleConfirmation = useCallback(async () => {
    try {
      setLoading(true);
      await onConfirm();
      setStatus('success');
      onClose();
    } catch (error) {
      setStatus('error');
      setError(
        (error as Error).message || 'Something went wrong. Please try again'
      );
    } finally {
      setLoading(false);
    }
  }, [onConfirm]);

  return (
    <Modal open={open}>
      <Box sx={styles}>
        <Stack sx={{ gap: '20px' }}>
          <Stack
            direction="column"
            sx={{
              gap: '2rem',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontFamily: 'Gelasio',
                // fontSize: "48px",
                fontWeight: '700',
              }}
            >
              To submit this message to your care team or coach, you must have
              an active weight loss membership.
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontFamily: 'Gelasio',
                // fontSize: "48px",
                fontWeight: '700',
              }}
            >
              Re-activate your weight loss membership?
            </Typography>
          </Stack>
          <Stack
            sx={{
              gap: '1rem',
              textAlign: 'center',
            }}
          >
            <Typography sx={{ fontFamily: 'Gelasio' }}>
              Your membership has been cancelled.
            </Typography>
            <Typography sx={{ fontFamily: 'Gelasio' }}>
              You must have an active membership to message your care team,
              order semaglutide or tirzepatide, or receive a prescription since
              your care team needs to be able to monitor you throughout your
              treatment.
            </Typography>
            <Typography sx={{ fontFamily: 'Gelasio' }}>
              Once you confirm below, you will be charged $
              {weightLossSubscriptions?.price} and you will begin your
              membership again.
            </Typography>
          </Stack>

          {status === 'idle' && (
            <>
              <LoadingButton
                loading={loading}
                fullWidth
                onClick={handleConfirmation}
              >
                <Typography
                  sx={{
                    color: '#fff',
                    fontFamily: 'Inter',
                    fontWeight: '600',
                    fontSize: '16px',
                    lineHeight: '22px',
                    letterSpacing: '0.5%',
                  }}
                >
                  Yes, renew my membership
                </Typography>
              </LoadingButton>
              <Button
                onClick={onClose}
                sx={{
                  borderRadius: '12px',
                  border: '1px solid #00531B',
                  // width: "80%",
                  height: '56px',
                  padding: '20px, 32px, 20px, 32px',
                  gap: '10px',
                  backgroundColor: 'transparent',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: 'Inter',
                    fontWeight: '600',
                    fontSize: '16px',
                    lineHeight: '22px',
                    letterSpacing: '0.5%',
                    color: '#1B1B1B',
                  }}
                >
                  Cancel
                </Typography>
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <ErrorMessage>{error}</ErrorMessage>
              <LoadingButton
                loading={loading}
                fullWidth
                onClick={handleConfirmation}
              >
                Try again
              </LoadingButton>
              <Button
                onClick={onClose}
                sx={{
                  borderRadius: '12px',
                  border: '1px solid #00531B',
                  // width: "80%",
                  height: '56px',
                  padding: '20px, 32px, 20px, 32px',
                  gap: '10px',
                  backgroundColor: 'transparent',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: 'Inter',
                    fontWeight: '600',
                    fontSize: '16px',
                    lineHeight: '22px',
                    letterSpacing: '0.5%',
                    color: '#1B1B1B',
                  }}
                >
                  Cancel
                </Typography>
              </Button>
            </>
          )}

          {status === 'success' && (
            <>
              <Typography textAlign="center" variant="h2">
                Your subscription has been reactivated.
              </Typography>
              <Button fullWidth variant="outlined" onClick={onClose}>
                Ok
              </Button>
            </>
          )}
        </Stack>
      </Box>
    </Modal>
  );
};

export default ReactivateSubscriptionModal;
