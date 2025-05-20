import { useCallback, useEffect, useState } from 'react';
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
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import ZealthyLogo from '@/components/shared/icons/ZealthyLogo';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { usePatient } from '@/components/hooks/data';
import axios from 'axios';
import { addHours, format } from 'date-fns';
import Logo from '@/components/shared/icons/Logo';
import { isMobile as isMobileDevice } from 'react-device-detect';

type Prescription = Database['public']['Tables']['prescription']['Row'];
type Order = Database['public']['Tables']['order']['Row'] & {
  prescription: Prescription;
};

interface Props {
  isOpen: boolean;
  order: Order;
}

const RateOrderModal = ({ isOpen, order }: Props) => {
  const theme = useTheme();
  const [open, setIsOpen] = useState(true);
  const supabase = useSupabaseClient<Database>();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const created_date = format(
    new Date(order?.created_at || ''),
    'EEEE, MMMM d, yyyy'
  );
  const [showTrustpilot, setShowTrustpilot] = useState(false);
  const { data: patient } = usePatient();
  const [loading, setLoading] = useState<boolean>(false);
  const patientName = `${patient?.profiles?.first_name} ${patient?.profiles?.last_name}`;
  const [hasTriggered, setHasTriggered] = useState<boolean>(false);

  const medication = order?.prescription?.medication?.split(' ')[0];
  const pharmacy = order?.prescription?.pharmacy;

  const medicationName = `${medication
    ?.charAt(0)
    ?.toUpperCase()}${medication?.slice(1)}`;

  useEffect(() => {
    if (!hasTriggered && isOpen) {
      window?.freshpaint?.track('rate-order-experience-displayed');
    }
    setHasTriggered(true);
  }, [hasTriggered, isOpen]);

  useEffect(() => {
    if (isOpen) {
      localStorage.setItem('zealthy_active_rating_modal', 'RateOrder');
    }

    return () => {
      if (isOpen) {
        localStorage.removeItem('zealthy_active_rating_modal');
      }
    };
  }, [isOpen]);

  const handleSubmit = async () => {
    setSubmitting(true);

    await supabase
      .from('order')
      .update({ feedback: { status: 'submitted', rating } })
      .eq('id', order.id);
    window.freshpaint?.track('rate-order-experience', {
      rating: rating,
      medication: medicationName,
      pharmacy: pharmacy,
    });

    if (rating === 5) {
      setShowTrustpilot(true);
      const reviewLink = await handleInvitationLink();
      window.freshpaint?.track('five-star-review-experience', {
        order_id: order.id,
        order_created: created_date,
        medication: medicationName,
        review_link: reviewLink,
        tp_review_click_source: 'CRM',
      });
    } else {
      setIsOpen(false);
    }
  };

  const handleSkip = async () => {
    setSkipping(true);
    const skipFeedback = order?.feedback as {
      status?: string;
      skip_attempts?: number;
    };
    const addSkipAttempt = skipFeedback?.skip_attempts
      ? skipFeedback.skip_attempts + 1
      : 1;
    const nextDisplayTime = addHours(new Date(), 12).toISOString();
    sessionStorage.setItem(`skipOrderRating`, nextDisplayTime);

    let query = await supabase
      .from('order')
      .update({
        feedback: {
          status: 'skipped',
          skip_attempts: addSkipAttempt,
        },
      })
      .eq('id', order.id);

    localStorage.removeItem('zealthy_active_rating_modal');
    setIsOpen(false);
  };

  const handleTrustpilotRating = async () => {
    await supabase.from('notifications').insert({
      display_at: addHours(new Date(), 24).toISOString(),
      recipient_id: patient?.profile_id!,
      sender_id: patient?.profile_id!,
      type: 'RATE_GOOGLE',
    });
    window.freshpaint?.track('click-rate-on-trustpilot', {
      tp_review_modal_source: 'Order',
      tp_review_click_source: 'Web App',
    });
    handleInvitationLink();
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
        setIsOpen(false);
        setLoading(false);

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

  const handleSkipTrustpilot = async () => {
    await supabase.from('notifications').insert({
      display_at: addHours(new Date(), 24).toISOString(),
      recipient_id: patient?.profile_id!,
      sender_id: patient?.profile_id!,
      type: 'RATE_TP',
      skip_count: 1,
    });
    window.freshpaint?.track('skip-rate-on-trustpilot');
    setIsOpen(false);
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
    <Modal open={isOpen && open}>
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
                  >
                    <b>Order ID:</b> {order.id}
                  </Typography>
                  <Typography
                    mt={0.5}
                    variant="h4"
                    textAlign="center"
                    color="#1B1B1B"
                  >
                    <b>Medication:</b> {medicationName}
                  </Typography>
                  {order?.tracking_number && order?.tracking_URL && (
                    <Typography
                      mt={0.5}
                      variant="h4"
                      textAlign="center"
                      color="#1B1B1B"
                    >
                      <b>Tracking:</b>{' '}
                      <a
                        href={order.tracking_URL}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {order.tracking_number}
                      </a>
                    </Typography>
                  )}
                  <Typography
                    mt={0.5}
                    variant="h4"
                    textAlign="center"
                    color="#1B1B1B"
                  >
                    <b>Order Placed:</b> {`${created_date}`}
                  </Typography>
                </Box>
                <Box paddingBottom={{ sm: 0, xs: '10px' }} paddingTop="32px">
                  <StarRating
                    value={rating}
                    onChange={setRating}
                    description={`Please rate your order experience`}
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

export default RateOrderModal;
