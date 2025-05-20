import { toast } from 'react-hot-toast';
import { useCallback, useState } from 'react';
import { addHours } from 'date-fns';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import {
  Box,
  Stack,
  Modal,
  Typography,
  useMediaQuery,
  useTheme,
  Button,
} from '@mui/material';
import StarRating from '@/components/shared/StarRating';
import { Database } from '@/lib/database.types';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { usePatient } from '@/components/hooks/data';
import axios from 'axios';
import Logo from '@/components/shared/icons/Logo';
import { isMobile as isMobileDevice } from 'react-device-detect';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const RateZealthyGenericModal = ({ isOpen, onClose }: Props) => {
  const theme = useTheme();
  const { data: patient } = usePatient();
  const supabase = useSupabaseClient<Database>();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [skipping, setSkipping] = useState(false);

  const [showTrustpilot, setShowTrustpilot] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const patientName = `${patient?.profiles?.first_name} ${patient?.profiles?.last_name}`;

  const handleSubmit = async () => {
    setSubmitting(true);
    const reviewLink = await handleInvitationLink();

    if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
      window.freshpaint?.track('rate-zealthy-experience', {
        rating,
        comment: '',
        device: isMobileDevice ? 'mobile' : 'web',
        review_link: rating === 5 ? reviewLink : '',
      });
    }

    try {
      if (rating === 5) {
        setShowTrustpilot(true);
      } else {
        toast.success('You have successfully submitted your review!');
      }
    } catch (e: any) {
      toast.error('Unable to successfully submit your review');
    } finally {
      if (rating !== 5) {
        onClose();
      }
    }
  };

  const handleSkip = async () => {
    setSkipping(true);

    onClose();
  };

  const handleInvitationLink = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        '/api/trustpilot/invitation-link',
        {
          patientName,
          email: patient?.profiles?.email,
          referenceId: patient?.profile_id,
          fromMobile: false,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (showTrustpilot) {
        onClose();
        setLoading(false);
        setShowTrustpilot(false);

        if (isMobileDevice) {
          return setTimeout(() => {
            window.open(response?.data?.url, '_top');
          });
        }
        return window.open(response?.data?.url, '_blank');
      } else {
        setLoading(false);
        return response?.data?.url;
      }
    } catch (error) {
      console.error('Error creating invitation link:', error);
    }
  }, [patient, patientName, showTrustpilot]);

  const handleTrustpilotRating = async () => {
    await supabase.from('notifications').insert({
      display_at: addHours(new Date(), 24).toISOString(),
      recipient_id: patient?.profile_id!,
      sender_id: patient?.profile_id!,
      type: 'RATE_GOOGLE',
    });

    if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
      window.freshpaint?.track('click-rate-on-trustpilot', {
        tp_review_modal_source: 'Purchase',
        tp_review_click_source: 'Web App',
      });
    }
    handleInvitationLink();
  };

  const handleSkipTrustpilot = async () => {
    await supabase.from('notifications').insert({
      display_at: addHours(new Date(), 24).toISOString(),
      recipient_id: patient?.profile_id!,
      sender_id: patient?.profile_id!,
      type: 'RATE_TP',
      skip_count: 1,
    });

    if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
      window.freshpaint?.track('skip-rate-on-trustpilot');
    }
    onClose();
  };

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

  return (
    <Modal open={isOpen}>
      <Box
        justifyContent="center"
        alignItems="center"
        borderRadius={2}
        sx={isMobile ? mobileSx : desktopSx}
      >
        <Stack gap={{ sm: '32px', xs: '24px' }}>
          {isMobile && (
            <Box
              sx={{
                color: 'inherit',
                alignSelf: 'center',
                marginBottom: '2rem',
              }}
            >
              <Logo />
            </Box>
          )}
          {showTrustpilot ? (
            <>
              <Stack alignItems="center">
                <Typography variant="h2" textAlign="center">
                  Please help with a public review
                </Typography>

                <Box paddingBottom={{ sm: 0, xs: '10px' }} paddingTop="32px">
                  <Typography
                    mt={0.5}
                    variant="h4"
                    textAlign="center"
                    color="#1B1B1B"
                  >
                    Would you please share your experience with Zealthy online?
                    Your review or rating will help people learn more about us.
                    That means we can spend less on advertising and keep service
                    costs low.
                  </Typography>
                  <Typography
                    mt={2}
                    variant="h4"
                    textAlign="center"
                    color="#1B1B1B"
                  >
                    It just takes 2 minutes and it helps a lot.
                  </Typography>
                </Box>
              </Stack>
              <Stack gap={2}>
                <LoadingButton
                  loading={loading}
                  size="small"
                  fullWidth
                  onClick={handleTrustpilotRating}
                >
                  Rate us on Trustpilot
                </LoadingButton>
                <Button
                  variant="text"
                  size="small"
                  onClick={handleSkipTrustpilot}
                >
                  Go back to your Zealthy portal
                </Button>
              </Stack>
            </>
          ) : (
            <>
              <Stack alignItems="center">
                <Typography variant="h2" textAlign="center">
                  Rate your Zealthy experience
                </Typography>

                <Box paddingBottom={{ sm: 0, xs: '10px' }} paddingTop="32px">
                  <Typography
                    mt={0.5}
                    variant="h4"
                    textAlign="center"
                    color="#1B1B1B"
                    fontWeight={600}
                  >
                    Thanks for submitting your recent order. Would you mind
                    rating how your experience has been going with Zealthy?
                  </Typography>
                </Box>
                <Box paddingBottom={{ sm: 0, xs: '10px' }} paddingTop="32px">
                  <StarRating
                    value={rating}
                    onChange={setRating}
                    description={`Please rate your experience`}
                  />
                </Box>
              </Stack>
              <Stack gap={2}>
                <LoadingButton
                  loading={submitting}
                  disabled={rating === 0}
                  onClick={handleSubmit}
                >
                  Submit review
                </LoadingButton>
                <LoadingButton
                  loading={skipping}
                  variant="text"
                  size="small"
                  onClick={handleSkip}
                >
                  Skip
                </LoadingButton>
              </Stack>
            </>
          )}
        </Stack>
      </Box>
    </Modal>
  );
};

export default RateZealthyGenericModal;
