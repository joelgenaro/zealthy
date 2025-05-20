import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Stack,
  Modal,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Button,
} from '@mui/material';
import ProfilePlaceholder from 'public/images/profile-placeholder.jpg';
import StarRating from '@/components/shared/StarRating';
import { ApptProps } from '../../PatientPortal';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import ZealthyLogo from '@/components/shared/icons/ZealthyLogo';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import axios from 'axios';
import { usePatient } from '@/components/hooks/data';
import DOMPurify from 'dompurify';
import { addHours, format } from 'date-fns';
import Logo from '@/components/shared/icons/Logo';
import { isMobile as isMobileDevice } from 'react-device-detect';

interface Props {
  isOpen: boolean;
  visit: ApptProps;
}

const RateVisitModal = ({ isOpen, visit }: Props) => {
  const theme = useTheme();
  const supabase = useSupabaseClient<Database>();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setIsOpen] = useState(true);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [showTrustpilot, setShowTrustpilot] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { data: patient } = usePatient();
  const [hasTriggered, setHasTriggered] = useState<boolean>(false);

  const date = format(
    new Date(visit?.starts_at || visit?.created_at || 0),
    'EEEE, MMMM d, yyyy'
  );

  const avatar = visit?.clinician?.profiles?.avatar_url!;
  const type = visit?.visit_type;
  const clinician = visit?.clinician?.profiles;
  const title = visit?.clinician?.type?.some(t => t.includes('MD'))
    ? 'Dr. '
    : '';

  const clinicianName = `${title}${clinician?.first_name} ${clinician?.last_name}`;
  const patientName = `${patient?.profiles?.first_name} ${patient?.profiles?.last_name}`;

  useEffect(() => {
    if (!hasTriggered && visit) {
      window?.freshpaint?.track('rate-synchronous-visit-displayed');
    }
    setHasTriggered(true);
  }, [hasTriggered, visit]);

  const handleSubmit = async () => {
    if (!visit?.id) return;
    setSubmitting(true);
    await supabase
      .from('appointment')
      .update({
        feedback: {
          status: 'submitted',
          rating,
          review: DOMPurify.sanitize(review, {
            USE_PROFILES: { html: false },
          }),
        },
      })
      .eq('id', visit.id);
    window.freshpaint?.track('rate-synchronous-visit', {
      provider_name: clinicianName,
      rating: rating,
    });

    if (rating === 5) {
      setShowTrustpilot(true);
      const reviewLink = await handleInvitationLink();
      window.freshpaint?.track('five-star-review-synchronous-visit', {
        clinician: clinicianName,
        visit_date: date,
        appointment_type: visit.appointment_type,
        review_link: reviewLink,
        tp_review_click_source: 'CRM',
      });
    } else {
      setIsOpen(false);
    }
  };

  const handleSkip = async () => {
    if (!visit.id) return;
    try {
      setSkipping(true);
      const skipFeedback = visit?.feedback as {
        status?: string;
        skip_attempts?: number;
      };
      const addSkipAttempt = (skipFeedback?.skip_attempts || 0) + 1;

      await supabase
        .from('appointment')
        .update({
          feedback: {
            status: 'skipped',
            skip_attempts: addSkipAttempt,
          },
        })
        .eq('id', visit.id);
    } catch (e: any) {
      throw new Error('Error skipping visit rating modal', e);
    } finally {
      setIsOpen(false);
    }
  };

  const handleTrustpilotRating = async () => {
    await supabase.from('notifications').insert({
      display_at: addHours(new Date(), 24).toISOString(),
      recipient_id: patient?.profile_id!,
      sender_id: patient?.profile_id!,
      type: 'RATE_GOOGLE',
    });
    window.freshpaint?.track('click-rate-on-trustpilot', {
      tp_review_modal_source: 'Synchronous Visit',
      tp_review_click_source: 'Web App',
    });
    handleInvitationLink();
  };

  const handleSkipTrustpilot = async () => {
    try {
      await supabase.from('notifications').insert({
        display_at: addHours(new Date(), 24).toISOString(),
        recipient_id: patient?.profile_id!,
        sender_id: patient?.profile_id!,
        type: 'RATE_TP',
        skip_count: 1,
      });
      window.freshpaint?.track('skip-rate-on-trustpilot');
    } catch (e: any) {
      throw new Error('Error skipping trustpilot review', e);
    } finally {
      setIsOpen(false);
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
              <Image
                width={80}
                height={80}
                alt="Care provider profile picture"
                src={avatar || ProfilePlaceholder}
                style={{
                  borderRadius: '50%',
                  margin: '0 auto',
                  objectFit: 'cover',
                }}
              />

              <Stack alignItems="center">
                <Typography variant="h2" textAlign="center">
                  {clinicianName}
                </Typography>
                <Typography
                  mt={0.5}
                  variant="h4"
                  textAlign="center"
                  color="#1B1B1B"
                >
                  {type && (
                    <Box component="span" fontWeight={600}>
                      {type} Visit
                    </Box>
                  )}

                  <br />
                  {date}
                </Typography>
                <Box paddingBottom={{ sm: 0, xs: '10px' }} paddingTop="32px">
                  <StarRating
                    value={rating}
                    onChange={setRating}
                    description={`Please rate your visit with ${clinicianName}`}
                  />
                </Box>
              </Stack>
              {!!rating && rating < 5 && (
                <Stack gap="16px">
                  <Typography variant="h4" color="#1B1B1B" textAlign="center">
                    Please provide us with more details (optional).
                  </Typography>
                  <TextField
                    sx={{ width: '100%' }}
                    multiline
                    rows={4}
                    placeholder="Type here..."
                    value={review}
                    onChange={e => setReview(e.target.value)}
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

export default RateVisitModal;
