import { useEffect, useState } from 'react';
import { Pathnames } from '@/types/pathnames';
import { useRouter } from 'next/router';
import { ProviderType } from '@/components/hooks/data';

import { useSupabaseClient } from '@supabase/auth-helpers-react';
import {
  Box,
  Stack,
  Modal,
  Button,
  Card,
  CardContent,
  Rating,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import ProfilePlaceholder from 'public/images/profile-placeholder.jpg';

import { Database } from '@/lib/database.types';

import React, { Dispatch } from 'react';
import toast from 'react-hot-toast';
import { addDays, format } from 'date-fns';
import axios from 'axios';

interface Props {
  isOpen: boolean;
  setIsOpen: (bool: boolean) => void;
  onSave?: () => void;
  coachOptions: any[];
  coachInfo: any;
  isMobile: boolean;
  isLoading: boolean;
  setIsLoading: Dispatch<React.SetStateAction<boolean>>;
  fetchCoaches: any;
  patientId: number;
  patientProfileId: string;
  patientFirstName: string;
  coachPath: string;
  coachType: string;
  patientCanvasId: string;
}

const NewCoachModal = ({
  isOpen,
  setIsOpen,
  coachOptions,
  isMobile,
  isLoading,
  setIsLoading,
  fetchCoaches,
  patientId,
  patientProfileId,
  patientFirstName,
  patientCanvasId,
  coachPath,
  coachInfo,
  coachType,
}: Props) => {
  const supabase = useSupabaseClient<Database>();

  const [readBio, setReadBio] = useState(
    new Array(coachOptions?.length || 0).fill(false)
  );

  console.log({ coachInfo }, 'here');

  const router = useRouter();

  useEffect(() => {
    setIsLoading(false);
  }, [!!isLoading]);

  const onConfirm = async (
    newCoach: number,
    prefix: string | undefined,
    firstName: string,
    lastName: string,
    coachProfileId: string,
    patientProfileId: string
  ) => {
    try {
      //When you replace the coach, look up all incomplete tasks that have assigned_clinician_id of old coach and patient_id of patient that is switching and change all of “visible” column to false.
      const { data: updatedCoach, error: updateCoachErr } = await supabase
        .from('patient_care_team')
        .update({ clinician_id: newCoach })
        .eq('clinician_id', coachInfo?.clinician_id)
        .eq('patient_id', patientId);

      if (updateCoachErr) {
        console.log(updateCoachErr);
        throw new Error('Unable to update coach');
      }

      const { data: oldTasks, error: oldTaskError } = await supabase
        .from('task_queue')
        .update({ visible: false })
        .eq('assigned_clinician_id', coachInfo?.clinician_id)
        .eq('patient_id', patientId)
        .is('completed_at', null);

      if (oldTaskError) {
        console.log(oldTaskError);
        throw new Error('Unable to update coach task');
      }
      const newCoachName = `${
        prefix ? `${prefix} ` : ''
      }${firstName} ${lastName}`;

      const { data: updatedGroup, error: updateGroupErr } = await supabase
        .from('messages_group')
        .update({ name: newCoachName })
        .eq(
          'name',
          `${
            coachInfo?.clinician?.profiles?.prefix
              ? `${coachInfo?.clinician?.profiles?.prefix} `
              : ''
          }${coachInfo?.clinician?.profiles?.first_name} ${
            coachInfo?.clinician?.profiles?.last_name
          }`
        )
        .eq('profile_id', patientProfileId)
        .select();

      if (updateGroupErr) throw new Error('Unable to update group');

      const { data: updatedMember, error: updateMemberErr } = await supabase
        .from('messages_group_member')
        .update({ clinician_id: newCoach })
        .eq('messages_group_id', updatedGroup[0]?.id)
        .eq('clinician_id', coachInfo?.clinician_id);

      if (updateMemberErr) {
        console.log(updateMemberErr);
        throw new Error('unable to update message group');
      }

      const { data: newPatientTask, error: newPatientError } = await supabase
        .from('task_queue')
        .insert({
          created_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx"),
          assigned_clinician_id: newCoach,
          clinician_assigned_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx"),
          provider_type: coachType as ProviderType,
          queue_type: 'Coach',
          task_type: 'NEW_PATIENT',
          patient_id: patientId,
        });

      if (newPatientError) {
        console.log('New patient error: ', { newPatientError });
        throw new Error('Unable to create new patient task');
      }

      const weightLossMessageNew = `Hi ${patientFirstName} - I’m ${newCoachName}, your new weight loss coach. I’m here to help with all of your weight loss needs, and can help you think through different strategies to supplement your medication. I’ve debriefed with your previous coach and have an understanding of your weight loss journey since joining Zealthy. Is there anything I can do to help right now?`;
      const mentalHealthMessageNew = `Hi ${patientFirstName} -  I’m ${newCoachName}, your new mental health coach. I’m here to help with all of your mental health needs, and can help you think through different strategies to supplement your medication. I’ve debriefed with your previous coach and have an understanding of how you were feeling before starting with Zealthy and how it’s been going so far. If you’d like, let’s go ahead and schedule your first live video session using this link: https://app.getzealthy.com/patient-portal/schedule-coach/mental-health. Don’t hesitate to message me to tell me how you’re feeling otherwise.`;

      const newMessageParams = {
        sender: `Practitioner/${coachProfileId}`,
        recipient: `Patient/${patientProfileId}`,
        message: coachType?.toLowerCase()?.includes('weight')
          ? weightLossMessageNew
          : mentalHealthMessageNew,
        groupId: updatedGroup[0]?.id,
        initialMessage: true,
      };

      await axios.post('/api/message', {
        data: newMessageParams,
      });

      // reset cadence on coach switch -- can only have one incomplete task per path
      const { data: futureActionItems, error: futureItemsError } =
        await supabase
          .from('patient_action_item')
          .select('*')
          .eq('patient_id', patientId)
          .eq('type', 'RATE_COACH')
          .eq('completed', false)
          .eq('canceled', false);

      if (futureItemsError) {
        console.log('Error fetching future action items:', futureItemsError);
        throw new Error('Unable to check action items');
      }

      // If there are any future action items, update the first one rather than creating a new one
      if (futureActionItems && futureActionItems.length > 0) {
        // Update the earliest one's created_at date
        const { data: newPatientItem, error: newPatientItemError } =
          await supabase
            .from('patient_action_item')
            .update({
              created_at: addDays(new Date(), 45).toISOString(),
            })
            .eq('id', futureActionItems[0].id);

        if (newPatientItemError) {
          console.log('New patient item error: ', {
            newPatientItemError,
          });
          throw new Error('Unable to update action item');
        }

        // Cancel any other duplicate RATE_COACH items
        if (futureActionItems.length > 1) {
          const otherItemIds = futureActionItems.slice(1).map(item => item.id);
          const { error: cancelError } = await supabase
            .from('patient_action_item')
            .update({
              canceled: true,
              canceled_at: new Date().toISOString(),
            })
            .in('id', otherItemIds);

          if (cancelError) {
            console.log('Error canceling duplicate items:', cancelError);
          }
        }
      } else {
        // No existing action items, create a new one
        const { data: newPatientItem, error: newPatientItemError } =
          await supabase.from('patient_action_item').insert({
            patient_id: patientId,
            created_at: addDays(new Date(), 45).toISOString(),
            type: 'RATE_COACH',
            title: 'Rate your coach',
            body: "Help us improve by rating your coach. This helps us reward our best coaches and enables you to request a different coach if you'd like.",
            path: Pathnames.PATIENT_PORTAL_RATE_COACH + coachPath,
          });

        if (newPatientItemError) {
          console.log('New patient item error: ', {
            newPatientItemError,
          });
          throw new Error('Unable to create new patient Item');
        }
      }

      setIsOpen(false);
      router.push(Pathnames.PATIENT_PORTAL);
    } catch (e: unknown) {
      toast.error(`Something went wrong ${(e as Error)?.message || ''}`);
    }
  };

  const desktopSx = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.default',
    minWidth: 1200,
    minHeight: 600,
    overflow: 'auto',
    p: 4,
    outline: 'none',
  };

  const mobileSx = {
    position: 'absolute',
    bgcolor: 'background.default',
    width: '100%',
    height: '81%',
    overflow: 'scroll',
    bottom: '10%',
  };

  return (
    <Modal open={isOpen}>
      <>
        <Box sx={isMobile ? mobileSx : desktopSx}>
          <Box sx={{ marginLeft: '5px' }}>
            <Typography
              variant="h3"
              textAlign={isMobile ? 'left' : 'center'}
              marginBottom={isMobile ? '10px' : '15px'}
            >
              We’re sorry to hear your coaching experience could be better.{' '}
            </Typography>
            <Typography
              variant={isMobile ? 'h4' : 'h4'}
              textAlign={isMobile ? 'left' : 'center'}
              marginBottom={isMobile ? '10px' : '15px'}
            >
              If you’d like, you can choose a new coach from the options below.{' '}
            </Typography>
          </Box>
          <Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 2,
              }}
            >
              {coachOptions?.length > 0
                ? coachOptions.map((coach, i) => (
                    <React.Fragment key={i}>
                      <Card
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                        }}
                      >
                        <>
                          <CardContent>
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                              }}
                            >
                              <div
                                style={{
                                  width: isMobile ? '40px' : '100px',
                                  height: isMobile ? '40px' : '100px',
                                  position: 'relative',
                                  alignSelf: 'center',
                                  display: isMobile ? 'flex' : 'inline-block',
                                  flexDirection: 'column',
                                  gap: '15',
                                }}
                              >
                                <Image
                                  layout="fill"
                                  objectFit="cover"
                                  alt="Care provider profile picture"
                                  src={
                                    coach?.profiles?.avatar_url ||
                                    ProfilePlaceholder
                                  }
                                  style={{
                                    borderRadius: '50%',
                                    margin: '0 auto',
                                  }}
                                />
                              </div>
                              <Typography variant="h3" textAlign="center">
                                {`${coach.profiles.first_name} ${coach.profiles.last_name}`}
                              </Typography>

                              <Stack alignItems="center">
                                <Box
                                  paddingBottom={{
                                    sm: 0,
                                    xs: '10px',
                                  }}
                                  paddingTop="0px"
                                >
                                  <Rating
                                    name="simple-controlled"
                                    value={coach?.average_score || 4}
                                    size={'large'}
                                    precision={0.5}
                                    readOnly
                                  />
                                </Box>
                                <Button
                                  onClick={() =>
                                    setReadBio(prev => {
                                      const before = [...prev];
                                      before[i] = !before[i];
                                      return before;
                                    })
                                  }
                                >
                                  {' '}
                                  {readBio[i] ? 'Collapse' : 'Read Bio'}
                                </Button>
                                <Typography
                                  sx={{
                                    maxWidth: '200px',
                                    maxHeight: isMobile ? '100px' : '140px',
                                    textOverflow: 'wrap',
                                    overflow: 'scroll',
                                    marginTop: isMobile ? '7px' : '10px',
                                  }}
                                >
                                  {readBio[i]
                                    ? coach?.bio || 'Check back later'
                                    : null}{' '}
                                </Typography>
                              </Stack>
                              {readBio[i] ? (
                                <Button
                                  sx={{
                                    borderRadius: '30px',
                                  }}
                                  onClick={() => {
                                    onConfirm(
                                      coach.id,
                                      coach?.profiles?.prefix,
                                      coach?.profiles?.first_name || 'Coach',
                                      coach?.profiles?.last_name || '',
                                      coach?.profiles?.id!,
                                      patientProfileId
                                    );
                                  }}
                                >
                                  Confirm
                                </Button>
                              ) : null}
                            </Box>
                          </CardContent>
                        </>
                      </Card>
                    </React.Fragment>
                  ))
                : null}
            </Box>
            <Box
              sx={{
                display: 'flex',

                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                width: '100%',
              }}
            >
              <Button
                sx={{
                  display: 'block',
                  marginTop: isMobile ? '10px' : '5%',
                  marginBottom: '5px',
                  width: isMobile ? '80%' : '40%',
                  borderRadius: '40px',
                }}
                size={isMobile ? 'medium' : 'large'}
                onClick={() => {
                  fetchCoaches();
                }}
              >
                {' '}
                {isLoading ? 'Loading...' : 'View more coaches'}
              </Button>
              <Button
                sx={{
                  display: 'block',
                  width: isMobile ? '80%' : '40%',
                  marginTop: isMobile ? '10px' : '20px',
                  marginBottom: isMobile ? '10px' : '5%',
                  borderRadius: '40px',
                  backgroundColor: '#636363',
                  '&:hover': {
                    backgroundColor: 'gray',
                  },
                }}
                size={isMobile ? 'small' : 'medium'}
                onClick={() => {
                  setIsOpen(false);
                  router.push(Pathnames.PATIENT_PORTAL);
                }}
              >
                {' '}
                Skip and keep your coach
              </Button>
            </Box>
          </Box>
        </Box>
      </>
    </Modal>
  );
};

export default NewCoachModal;
