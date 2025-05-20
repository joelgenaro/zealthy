import { useCallback, useState } from 'react';

import {
  Typography,
  Stack,
  Box,
  TextField,
  Button,
  useMediaQuery,
  useTheme,
  Container,
  Grid,
} from '@mui/material';

import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { usePatient, usePatientCareTeam } from '@/components/hooks/data';
import { useRatableCoachItems } from '@/components/hooks/useRatableCoachItems';

import NewCoachModal from './NewCoachModal';
import { CoachCard } from './Card';
import { useRouter } from 'next/router';
import { addDays, addHours, format, subDays } from 'date-fns';
import toast from 'react-hot-toast';
import { Pathnames } from '@/types/pathnames';
import { useQueryClient } from 'react-query';
import axios from 'axios';
import DOMPurify from 'dompurify';
import LoadingButton from '@/components/shared/Button/LoadingButton';

interface RateCoachProps {
  coachPath: string;
}

const RateCoach = ({ coachPath }: RateCoachProps) => {
  const supabase = useSupabaseClient();
  const { data: careTeam } = usePatientCareTeam();

  const router = useRouter();

  const queryClient = useQueryClient();

  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [coachOptions, setCoachOptions] = useState<any>();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);
  const coachInfo = careTeam?.find(
    el =>
      el?.role ===
      (coachPath === 'WEIGHT_LOSS'
        ? 'Weight Loss Coach'
        : 'Mental Health Coach')
  );
  const type = coachInfo?.role;
  const avatar = coachInfo?.clinician?.profiles?.avatar_url;

  const [seenIds, setSeenIds] = useState<number[]>([
    coachInfo?.clinician_id as number,
  ]);

  const currCoachName = `${coachInfo?.clinician?.profiles?.first_name} ${coachInfo?.clinician?.profiles?.last_name}`;

  const { data: patient } = usePatient();
  const patientName = `${patient?.profiles?.first_name} ${patient?.profiles?.last_name}`;

  const currItem = useRatableCoachItems().data?.filter(({ path }) =>
    path?.includes(coachPath)
  );

  const handleInvitationLink = useCallback(async () => {
    try {
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

      return response?.data?.url;
    } catch (error) {
      console.error('Error creating invitation link:', error);
    }
  }, [patient, patientName]);

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

  const clinicianCoachType =
    type === 'Weight Loss Coach'
      ? 'Coach (Weight Loss)'
      : 'Coach (Mental Health)';

  const fetchCoaches = useCallback(async () => {
    // push qualified coaches here until we have at least 4
    const coaches = [];

    setIsLoading(true);

    const { data: fiveStars, error: fiveStarErr } = await supabase
      .from('clinician')
      .select('*, profiles!inner(*)')
      .contains('type', [clinicianCoachType])
      .eq('status', 'ON')
      .not(
        'id',
        'in',
        `(${seenIds.filter(id => typeof id === 'number').join(',')})` //filter to remove leading commas that may appear in joined string
      )
      .gte('patient_average', 4.51)
      .limit(4);

    if (fiveStarErr) {
      console.log('five star err', fiveStarErr);
      toast.error('Unable to fetch coach options');
      return;
    }

    console.log(fiveStars, fiveStarErr, 'platy');
    // dont present options again on new search

    coaches.push(...fiveStars!);

    //downgrade search to 4 stars if we don't have enough options
    if (coaches.length < 4) {
      const { data: fourStars, error: fourStarErr } = await supabase
        .from('clinician')
        .select('*, profiles!inner(*)')
        .contains('type', [clinicianCoachType])
        .eq('status', 'ON')
        .not(
          'id',
          'in',
          `(${seenIds.filter(id => typeof id === 'number').join(',')})`
        )
        .gte('patient_average', 4.0)
        .lte('patient_average', 4.5)
        .limit(4);

      if (fourStarErr) {
        toast.error('Unable to fetch coach options');
        console.log('four star err: ', fourStarErr);
        return;
      }

      if (fourStars?.length) coaches.push(...fourStars);

      if (coaches.length < 4) {
        const { data: threeStars, error: threeStarErr } = await supabase
          .from('clinician')
          .select('*, profiles!inner(*)')
          .contains('type', [clinicianCoachType])
          .eq('status', 'ON')
          .not(
            'id',
            'in',
            `(${seenIds.filter(id => typeof id === 'number').join(',')})`
          )
          .gte('patient_average', 3.0)
          .lte('patient_average', 4.0)
          .limit(4);

        if (threeStarErr) {
          console.log('three star err', threeStarErr);
          toast.error('Unable to fetch coach options');

          return;
        }

        if (threeStars?.length!) coaches.push(...threeStars);
      }
    }
    const visibleOptions = coaches.slice(0, 4);
    const newSeen = visibleOptions.map(coach => coach?.id);
    // only mark coach as seen if they fall within the slice

    setSeenIds(prev => [...prev, ...newSeen]);

    setCoachOptions(visibleOptions);

    //show modal to choose a new coach
    if (rating <= 3) setIsOpen(true);
  }, [coachInfo, seenIds, rating]);

  const onSubmit = useCallback(async () => {
    try {
      setIsButtonLoading(true);
      //insert score
      const { data: audit, error: auditErr } = await supabase
        .from('audit')
        .insert({
          reviewer_id: patient?.profile_id,
          reviewee_id: coachInfo?.clinician.profile_id,
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          is_patient: true,
          review_score: rating,
          patient_note: DOMPurify.sanitize(!!note ? note : '', {
            USE_PROFILES: { html: false },
          }),
        })
        .select();
      if (auditErr) {
        console.log('Audit submission error: ', auditErr);
        throw new Error('Unable to add score');
      }

      const { data: completeAction, error: completeActionErr } = await supabase
        .from('patient_action_item')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', currItem![0]?.id! as number);

      if (completeActionErr) {
        console.log('complete action error: ', completeActionErr);
        throw new Error('Unable to complete action');
      }
      queryClient.invalidateQueries('rateCoaches');
      queryClient.invalidateQueries('actionItems');

      // get count of previous audits in order to generate proper cadence for next action creation
      const { count: reviewCount, error: countErr } = await supabase
        .from('audit')
        .select('id', { count: 'exact' })
        .eq('reviewer_id', patient?.profile_id)
        .eq('reviewee_id', coachInfo?.clinician?.profiles?.id);

      if (countErr) {
        console.log('Error in reviewCount ', countErr);
        throw new Error('Unable to create new action');
      }

      let daysUntilAudit;
      if (reviewCount === 1) daysUntilAudit = 75;
      if (reviewCount === 2) daysUntilAudit = 150;
      if (reviewCount && reviewCount > 2) daysUntilAudit = 180;

      // Check for existing future RATE_COACH action items before creating a new one
      const { data: futureActionItems, error: futureItemsErr } = await supabase
        .from('patient_action_item')
        .select('*')
        .eq('patient_id', patient?.id!)
        .eq('type', 'RATE_COACH')
        .eq('completed', false)
        .eq('canceled', false)
        .gt('created_at', new Date().toISOString()); // Future items

      if (futureItemsErr) {
        console.log('Error checking future action items: ', futureItemsErr);
      }

      // Only create a new action item if there are no future ones already
      if (!futureActionItems || futureActionItems.length === 0) {
        const { data: createNewAction, error: createActionErr } = await supabase
          .from('patient_action_item')
          .insert({
            patient_id: patient?.id,
            created_at: addDays(
              new Date(),
              daysUntilAudit as number
            ).toISOString(),
            type: 'RATE_COACH',
            title: 'Rate your coach',
            body: "Help us improve by rating your coach. This helps us reward our best coaches and enables you to request a different coach if you'd like.",
            path: Pathnames.PATIENT_PORTAL_RATE_COACH + coachPath,
          });

        if (createActionErr) {
          console.log('Create action error: ', createActionErr);
          throw new Error('Unable to create new action');
        }
      } else {
        console.log(
          'Future RATE_COACH action item already exists, skipping creation.'
        );
      }

      //generate average score for last 45 days
      const { data: patientAudits } = await supabase
        .from('audit')
        .select('review_score')
        .eq('reviewee_id', coachInfo?.clinician.profile_id)
        .eq('is_patient', true)
        .gte('completed_at', subDays(new Date(), 45).toISOString());

      const aggregateTotal = patientAudits!.reduce(
        (total, { review_score }) => {
          if (review_score) return total + review_score;
          return total;
        },
        0
      );

      const length = patientAudits?.length || 0;

      const newAverage = aggregateTotal / length;

      const { data: updatedClin } = await supabase
        .from('clinician')
        .update({ patient_average: newAverage })
        .eq('profile_id', coachInfo?.clinician.profile_id)
        .select();

      window.freshpaint?.track('rate-coach-experience', {
        coach_name: currCoachName,
        rating: rating,
      });

      if (rating === 5) {
        const reviewLink = await handleInvitationLink();
        window.freshpaint?.track('five-star-coach-rating', {
          clinician: currCoachName,
          review_date: format(new Date(), 'EEEE, MMMM d, yyyy'),
          review_link: reviewLink,
          tp_review_click_source: 'CRM',
        });
        router.push(`/patient-portal/trust-pilot-review`);
      } else if (rating <= 3) {
        fetchCoaches();
        setIsOpen(true);
      } else {
        toast.success('Success!');
        router.push(Pathnames.PATIENT_PORTAL);
      }
      setIsButtonLoading(false);
      return audit;
    } catch (e: any) {
      setIsButtonLoading(false);
      toast.error(e.message || 'Unable to complete coach rating');
    } finally {
      setIsButtonLoading(false);
    }
  }, [supabase, patient, note, fetchCoaches, rating, coachInfo, currItem]);

  return (
    <>
      <Container
        sx={{
          display: 'flex',
          width: isMobile ? '100%' : '50%',
          justifyContent: 'center',
        }}
      >
        <Grid container direction="column" gap={1.5}>
          <Box
            borderRadius={2}
            sx={{
              backGroundColor: '#FFFAF2',
            }}
          >
            <Typography
              variant={'h1'}
              sx={{
                textAlign: 'center',
                marginBottom: isMobile ? 0 : '13px',
              }}
            >
              Rate Your {type}
            </Typography>

            <Stack gap={{ sm: '32px', xs: '24px' }}>
              <CoachCard
                avatar={avatar || ''}
                coachInfo={coachInfo}
                rating={rating}
                setRating={setRating}
                isMobile={isMobile}
              />

              <Stack gap={isMobile ? '8px' : '16px'}>
                {rating === 5 ? null : (
                  <>
                    <Typography
                      sx={{
                        fontSize: isMobile ? '10px' : '5rem',
                      }}
                      color="#1B1B1B"
                      textAlign="center"
                    >
                      Take a moment to leave a review about your coaching
                      experience. This is a powerful way to recognize the
                      efforts of your coach and also to provide feedback so they
                      can be more helpful to you in the future.
                    </Typography>
                    <TextField
                      sx={{ width: '100%' }}
                      multiline
                      rows={4}
                      placeholder="Type here..."
                      value={note}
                      onChange={e => setNote(e.target.value)}
                    />
                  </>
                )}

                <LoadingButton
                  loading={isButtonLoading}
                  disabled={isOpen || !rating || !currItem?.length}
                  onClick={onSubmit}
                >
                  {currItem?.length ? 'Submit review' : 'Unavailable'}
                </LoadingButton>
              </Stack>
            </Stack>
          </Box>
        </Grid>
      </Container>
      <NewCoachModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        coachInfo={coachInfo!}
        coachOptions={coachOptions}
        isMobile={isMobile}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        fetchCoaches={fetchCoaches}
        patientId={patient?.id || 0}
        patientProfileId={patient?.profile_id || ''}
        coachType={clinicianCoachType}
        coachPath={coachPath}
        patientFirstName={patient?.profiles?.first_name!}
        patientCanvasId={patient?.canvas_patient_id!}
      />
    </>
  );
};

export default RateCoach;
