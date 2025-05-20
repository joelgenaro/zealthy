import Image from 'next/image';
import Router from 'next/router';
import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Modal,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Circle from '@/components/shared/Circle';
import { Pathnames } from '@/types/pathnames';
import {
  useAppointmentActions,
  useAppointmentAsync,
  useAppointmentSelect,
} from '@/components/hooks/useAppointment';
import ProfilePlaceholder from 'public/images/profile-placeholder.jpg';
import VisitSummary from '../VisitSummary';
import { AppointmentState } from '@/context/AppContext/reducers/types/appointment';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { CarePersonType, CoachType } from '@/types/carePersonType';
import { clinicianTitle } from '@/utils/clinicianTitle';
import AvailableTimeSlots from '@/components/shared/AvailableTimeSlots';
import { PractitionerWithSchedule } from '@/components/hooks/useProviderSchedule';
import {
  useActivePatientSubscription,
  usePatient,
  usePatientCoach,
} from '@/components/hooks/data';
import { mentalHealthCoachingBooked } from '@/utils/freshpaint/events';

const parseCanvasTimeSlot = (acc: SlotsByDay, slot: CanvasSlot) => {
  const day = slot.day;
  if (!acc[day]) {
    acc[day] = [];
  }
  acc[day].push(slot);
  return acc;
};

type CanvasSlot = {
  start: string;
  end: string;
  day: string;
};

type SlotsByDay = {
  [key: string]: CanvasSlot[];
};

interface Props {
  practitioner: PractitionerWithSchedule;
  coachType: CoachType;
}

const ProviderSchedule = ({ practitioner, coachType }: Props) => {
  const { addAppointment } = useAppointmentActions();
  const { createAppointment } = useAppointmentAsync();
  const appointment = useAppointmentSelect(appointments =>
    appointments.find(a => a.appointment_type === coachType)
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showModal, setShowModal] = useState<boolean>(false);
  const [slots, setSlots] = useState<SlotsByDay | null>(null);
  const [hideCard, setHideCard] = useState<boolean>(false);
  const [creatingAppointment, setCreatingAppointment] =
    useState<boolean>(false);
  const { data: patient } = usePatient();
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const { data: patientCoach } = usePatientCoach();
  const [isSlotSelected, setIsSlotSelected] = useState<boolean>(false);

  const specialty = `${
    coachType == CarePersonType.MENTAL_HEALTH ? 'Mental Health' : 'Weight Loss'
  } Coach`;
  const visitDuration = coachType == CarePersonType.MENTAL_HEALTH ? 45 : 15;
  const title = clinicianTitle(practitioner?.clinician);
  const { data: subscriptions } = useActivePatientSubscription();

  useEffect(() => {
    const sortSlots = async () => {
      if (practitioner.schedule) {
        const slotsByDay = practitioner?.schedule.reduce(
          parseCanvasTimeSlot,
          {}
        );
        if (
          Object.keys(slotsByDay).length &&
          Object.keys(slotsByDay).some(key => !!slotsByDay[key].length)
        ) {
          setSlots(slotsByDay);
          setHideCard(false);
          return;
        }
        return;
      }
    };
    sortSlots();
  }, [practitioner]);

  async function handleSelectAppointment(slot: CanvasSlot) {
    if (isSlotSelected) return;
    setIsSlotSelected(true);

    let status: 'Requested' | 'Confirmed' = 'Confirmed';
    if (
      !subscriptions?.some(
        sub => sub.subscription.name === 'Mental Health Coaching'
      ) &&
      coachType === 'Coach (Mental Health)'
    ) {
      status = 'Requested';
    }
    const appointment: AppointmentState = {
      canvas_appointment_id: null,
      encounter_type: 'Scheduled',
      appointment_type: coachType,
      id: 0,
      visit_type: 'Video',
      location: '',
      payer_name: '',
      provider: {
        id: practitioner?.clinician?.id,
        first_name: practitioner?.clinician?.profiles.first_name,
        last_name: practitioner?.clinician.profiles.last_name,
        avatar_url: practitioner?.clinician.profiles.avatar_url,
        specialties: practitioner?.clinician.specialties,
        zoom_link: practitioner?.clinician.zoom_link,
        daily_room: practitioner?.clinician.daily_room,
        canvas_practitioner_id: practitioner?.clinician.canvas_practitioner_id,
        email: practitioner?.clinician.profiles.email,
        onsched_resource_id:
          practitioner?.clinician?.profiles?.onsched_resource_id,
      },
      starts_at: slot.start,
      ends_at: slot.end,
      status: status,
      duration: visitDuration,
      description: `1:1 ${coachType} coaching`,
      daily_room: '',
      onsched_appointment_id: '',
      last_automated_call: null,
    };

    addAppointment(appointment);
    setShowModal(true);
  }

  async function handleScheduleAppointment() {
    if (!appointment) return;
    setCreatingAppointment(true);
    let patient_id = patient?.canvas_patient_id;
    if (!patient_id) {
      const { data } = await supabase
        .from('patient')
        .select('canvas_patient_id')
        .eq('profile_id', user!.id)
        .single();
      if (data) patient_id = data.canvas_patient_id;
    }

    await createAppointment(
      {
        type: appointment.encounter_type,
        appointment_type: appointment.appointment_type,
        provider: appointment.provider!,
        starts_at: appointment.starts_at!,
        ends_at: appointment.ends_at!,
        status: appointment.status,
        duration: appointment.duration,
      },
      patient!
    )
      .then(async () => {
        setCreatingAppointment(false);
        const currCoachName = `${patientCoach?.first_name} ${patientCoach?.last_name}`;
        const newCoachName = `${appointment.provider?.first_name} ${appointment.provider?.last_name}`;
        const message_group_id = await supabase
          .from('messages_group')
          .update({
            name: newCoachName,
          })
          .eq('profile_id', patient?.profile_id!)
          .eq('name', currCoachName)
          .select('id')
          .single()
          .then(({ data }) => data);

        await supabase
          .from('messages_group_member')
          .update({ clinician_id: appointment.provider?.id })
          .eq('messages_group_id', message_group_id?.id!);

        if (patientCoach?.clinician_id !== appointment.provider?.id) {
          await supabase.from('task_queue').insert({
            assigned_clinician_id: appointment.provider?.id,
            task_type: 'CUSTOM_TASK',
            patient_id: patient?.id,
            note: 'Please message your new coaching patient',
          });
        }
        const patientCareTeam = await supabase
          .from('patient_care_team')
          .select()
          .eq('patient_id', patient?.id!)
          .eq('role', specialty);
        if (!patientCareTeam) {
          await supabase.from('patient_care_team').insert({
            patient_id: patient?.id,
            clinician_id: appointment.provider?.id,
            role: specialty,
          });
        } else {
          await supabase
            .from('patient_care_team')
            .update({
              clinician_id: appointment.provider?.id,
            })
            .eq('patient_id', patient?.id!)
            .eq('role', specialty);
        }

        if (coachType === 'Coach (Mental Health)') {
          const { data: scheduledAppointment } = await supabase
            .from('appointment')
            .select()
            .eq('patient_id', patient?.id!)
            .eq('appointment_type', 'Coach (Mental Health)')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          mentalHealthCoachingBooked(
            patient?.profiles.id,
            patient?.profiles.email,
            scheduledAppointment?.starts_at,
            `https://app.getzealthy.com/visit/room/${scheduledAppointment?.daily_room}?appointment=${scheduledAppointment?.id}`
          );
        }

        if (Router.pathname.includes('patient-portal')) {
          Router.push(
            coachType === 'Coach (Mental Health)'
              ? Pathnames.PATIENT_PORTAL_MENTAL_COACH_CONFIRMATION
              : Pathnames.PATIENT_PORTAL_WEIGHT_COACH_CONFIRMATION
          );
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  if (hideCard) {
    return null;
  }

  return (
    <Box
      paddingY="33px"
      paddingX={{ md: '33px', xs: 0 }}
      width="100%"
      border="1px solid #989898"
      borderRadius="4px"
    >
      <Grid
        container
        direction="column"
        display="grid"
        gridTemplateColumns={isMobile ? '1fr' : '232px 1fr'}
        gap="16px"
        alignItems="center"
      >
        <Grid
          container
          direction="column"
          gap="34px"
          alignSelf="flex-start"
          alignItems="center"
        >
          <Box position="relative">
            <Circle size="200px">
              <Image
                src={
                  practitioner.clinician.profiles.avatar_url ||
                  ProfilePlaceholder
                }
                width="200"
                height="200"
                alt="image of a care provider"
                style={{ objectFit: 'cover' }}
              />
            </Circle>
          </Box>
          <Grid container direction="column" gap="0px" alignItems="center">
            <Typography
              fontSize="20px"
              lineHeight="28px"
              fontWeight="500"
              textAlign="center"
            >
              {title}
            </Typography>
            {!!specialty && (
              <Typography textAlign="center" color="#777777">
                {specialty}
              </Typography>
            )}
          </Grid>
        </Grid>
        <Box sx={{ height: 'auto', overflow: 'hidden' }}>
          <AvailableTimeSlots
            slots={slots || {}}
            handleSelectAppointment={handleSelectAppointment}
            isSlotSelected={isSlotSelected}
          />
        </Box>
        <Modal open={showModal && !!appointment?.provider}>
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
              minWidth: 300,
              minHeight: 300,
              p: 4,
              outline: 'none',
              borderRadius: '8px',
            }}
          >
            <Typography variant="h4">Confirm this coach and session</Typography>
            <VisitSummary appointment={appointment!} />
            <Stack width="100%" gap="1rem">
              <LoadingButton
                loading={creatingAppointment}
                fullWidth
                onClick={handleScheduleAppointment}
              >
                Confirm
              </LoadingButton>
              <Button
                fullWidth
                color="grey"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Modal>
      </Grid>
    </Box>
  );
};

export default ProviderSchedule;
