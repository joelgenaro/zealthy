import { toast } from 'react-hot-toast';
import { useCallback, useEffect, useState } from 'react';
import { addHours, differenceInMonths } from 'date-fns';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import {
  Box,
  Stack,
  Modal,
  Typography,
  useMediaQuery,
  useTheme,
  TextField,
  Button,
} from '@mui/material';
import StarRating from '@/components/shared/StarRating';
import { Database } from '@/lib/database.types';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { usePatient } from '@/components/hooks/data';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { ModalQueueType } from '../PriorityModals';
import Logo from '@/components/shared/icons/Logo';
import { isMobile as isMobileDevice } from 'react-device-detect';

interface Props {
  createdAt: string;
  refetch?: () => void;
  isOpen: boolean;
  onClose: () => void;
  addToQueue: (modalName: ModalQueueType) => void;
}

const DELAY_BETWEEN_SKIPS = 3 * 60 * 1000;
const MAX_SKIPS = 3;

const RateZealthyModal = ({
  createdAt,
  refetch,
  isOpen,
  onClose,
  addToQueue,
}: Props) => {
  const theme = useTheme();
  const { data: patient } = usePatient();
  const supabase = useSupabaseClient<Database>();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [minSubAge, setMinSubAge] = useState(0);
  const [showTrustpilot, setShowTrustpilot] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const patientName = `${patient?.profiles?.first_name} ${patient?.profiles?.last_name}`;
  const [hasTriggered, setHasTriggered] = useState<boolean>(false);
  const [existingFeedbackId, setExistingFeedbackId] = useState<
    string | number | null
  >(null);

  useEffect(() => {
    const subAgeInMonths = differenceInMonths(new Date(), new Date(createdAt));
    if (subAgeInMonths >= 12) {
      setMinSubAge(
        subAgeInMonths % 3 === 0
          ? subAgeInMonths
          : subAgeInMonths - (subAgeInMonths % 3)
      );
    } else if (subAgeInMonths >= 9) {
      setMinSubAge(9);
    } else if (subAgeInMonths >= 6) {
      setMinSubAge(6);
    } else if (subAgeInMonths >= 5) {
      setMinSubAge(5);
    } else if (subAgeInMonths >= 4) {
      setMinSubAge(4);
    } else if (subAgeInMonths >= 3) {
      setMinSubAge(3);
    } else if (subAgeInMonths >= 2) {
      setMinSubAge(2);
    } else if (subAgeInMonths >= 1) {
      setMinSubAge(1);
    }
  }, [createdAt]);

  useEffect(() => {
    if (minSubAge !== 0 && patient?.id && !isOpen) {
      const checkFeedback = async () => {
        try {
          const { data: feedback } = await supabase
            .from('subscriber_feedback')
            .select('*')
            .eq('patient_id', patient.id)
            .eq('month_interval', minSubAge)
            .single();

          const hasRating =
            feedback?.score !== null && feedback?.score !== undefined;
          const hasMaxSkips = (feedback?.skip_count ?? 0) >= MAX_SKIPS;
          const hasSkips = (feedback?.skip_count ?? 0) > 0;

          // Get lastSkipTime from localStorage
          const storedLastSkipTime = localStorage.getItem('lastSkipTime');
          const timeSinceLastSkip = storedLastSkipTime
            ? Date.now() - parseInt(storedLastSkipTime, 10)
            : null;

          const shouldWait =
            hasSkips &&
            timeSinceLastSkip &&
            timeSinceLastSkip < DELAY_BETWEEN_SKIPS;

          if (hasRating || hasMaxSkips) {
            return;
          }

          if (shouldWait) {
            return;
          }

          if (feedback?.skipped) {
            setExistingFeedbackId(feedback.id);
          }

          console.log('Adding RateZealthy modal to queue');
          addToQueue('RateZealthy');
        } catch (error) {
          console.error('Error checking feedback:', error);
        }
      };

      void checkFeedback();
    }
  }, [minSubAge, patient, isOpen, supabase, addToQueue]);

  useEffect(() => {
    if (!hasTriggered && isOpen) {
      window?.freshpaint?.track('rate-zealthy-experience-displayed');
      setHasTriggered(true);
    }
  }, [hasTriggered, isOpen]);

  const handleSubmit = async () => {
    if (rating < 5 && !comment) {
      alert('Comment required');
      return;
    }
    setSubmitting(true);

    try {
      const reviewLink = await handleInvitationLink();
      window.freshpaint?.track('rate-zealthy-experience', {
        rating,
        comment,
        review_link: rating === 5 ? reviewLink : '',
      });

      if (existingFeedbackId) {
        await updateExistingFeedback();
      } else {
        await createNewFeedback();
      }

      if (rating === 5) {
        setShowTrustpilot(true);
      } else {
        toast.success('You have successfully submitted your review!');
        onClose();
        refetch?.();
      }
    } catch (error) {
      toast.error('Unable to successfully submit your review');
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const updateExistingFeedback = async () => {
    const { error } = await supabase
      .from('subscriber_feedback')
      .update({
        comment: DOMPurify.sanitize(comment, {
          USE_PROFILES: { html: false },
        }),
        score: rating,
        skipped: false,
      })
      .eq('id', existingFeedbackId || '');

    if (error) throw error;

    if (rating === 5) {
      const reviewLink = await handleInvitationLink();
      window.freshpaint?.track('five-star-review-month', {
        review_link: reviewLink,
        tp_review_click_source: 'CRM',
      });
      setShowTrustpilot(true);
    } else {
      await addToTaskQueue();
    }
  };

  const createNewFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriber_feedback')
        .insert({
          comment: DOMPurify.sanitize(comment, {
            USE_PROFILES: { html: false },
          }),
          score: rating,
          month_interval: minSubAge,
          patient_id: patient?.id!,
        })
        .select('*')
        .single();

      if (error) throw error;

      if (rating === 5) {
        const reviewLink = await handleInvitationLink();
        window.freshpaint?.track('five-star-review-month', {
          review_link: reviewLink,
          tp_review_click_source: 'CRM',
        });
        setShowTrustpilot(true);
      } else {
        await addToTaskQueue();
      }
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  };

  const addToTaskQueue = async () => {
    const { data: queueData } = await supabase
      .from('task_queue')
      .insert({
        provider_type: 'Lead Coordinator',
        task_type: 'SUBSCRIBER_FEEDBACK',
        patient_id: patient?.id,
        queue_type: 'Lead Coordinator',
      })
      .select()
      .single();

    if (queueData?.id) {
      await supabase
        .from('subscriber_feedback')
        .update({ queue_id: queueData.id })
        .eq('id', existingFeedbackId || queueData.id);
    }
  };

  const handleSkip = async () => {
    setSkipping(true);

    // Store lastSkipTime in localStorage with current timestamp
    const currentTime = Date.now();
    localStorage.setItem('lastSkipTime', currentTime.toString());

    console.log('Skipping feedback, setting lastSkipTime:', currentTime);

    try {
      const { data: existingRecords } = await supabase
        .from('subscriber_feedback')
        .select('*')
        .eq('patient_id', patient?.id!)
        .eq('month_interval', minSubAge)
        .eq('skipped', true);

      if (existingRecords && existingRecords.length > 0) {
        const record = existingRecords[0];
        const newSkipCount = (record.skip_count || 0) + 1;

        await supabase
          .from('subscriber_feedback')
          .update({ skip_count: newSkipCount })
          .eq('id', record.id);

        console.log('Updated skip count to:', newSkipCount);
      } else {
        const { data } = await supabase
          .from('subscriber_feedback')
          .insert({
            skipped: true,
            month_interval: minSubAge,
            patient_id: patient?.id!,
            skip_count: 1,
          })
          .select()
          .single();

        console.log('Created new feedback record with skip:', data);
      }

      onClose();
    } catch (error) {
      console.error('Error skipping feedback:', error);
      toast.error('Unable to skip feedback');
    } finally {
      setSkipping(false);
    }
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
    window.freshpaint?.track('click-rate-on-trustpilot', {
      tp_review_modal_source: 'Month',
      tp_review_click_source: 'Web App',
    });
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
    window.freshpaint?.track('skip-rate-on-trustpilot');
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
                    You've been using Zealthy for at least{' '}
                    {minSubAge > 1 ? `${minSubAge} months` : `1 month`}. We want
                    to know how it's going!
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
              {!!rating && rating < 5 && (
                <Stack gap="16px">
                  <Typography variant="h4" color="#1B1B1B" textAlign="center">
                    Please provide us with more details (required)
                  </Typography>
                  <TextField
                    sx={{ width: '100%' }}
                    multiline
                    rows={4}
                    placeholder="Type here..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                </Stack>
              )}
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

export default RateZealthyModal;
