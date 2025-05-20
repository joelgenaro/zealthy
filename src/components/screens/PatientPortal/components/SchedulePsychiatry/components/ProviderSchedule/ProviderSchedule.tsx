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
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { clinicianTitle } from '@/utils/clinicianTitle';
import AvailableTimeSlots from '@/components/shared/AvailableTimeSlots';
import { PractitionerWithSchedule } from '@/components/hooks/useProviderSchedule';
import { usePatient, useIsFirstAppointment } from '@/components/hooks/data';
import { format, isBefore } from 'date-fns';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';

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
  subscriptionEnd?: string;
}

const ProviderSchedule = ({ practitioner, subscriptionEnd }: Props) => {
  const { addAppointment } = useAppointmentActions();
  const { createAppointment } = useAppointmentAsync();
  const { data: isFirstAppointment } = useIsFirstAppointment(
    'Anxiety and depression'
  );
  const appointment = useAppointmentSelect(appointments =>
    appointments.find(a => a.appointment_type === 'Provider')
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [slots, setSlots] = useState<SlotsByDay | null>(null);
  const [hideCard, setHideCard] = useState<boolean>(false);
  const [creatingAppointment, setCreatingAppointment] =
    useState<boolean>(false);
  const { data: patient } = usePatient();
  const visitDuration = isFirstAppointment ? 30 : 15;
  const title = clinicianTitle(practitioner?.clinician);
  const [isSlotSelected, setIsSlotSelected] = useState<boolean>(false);

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
    setIsSlotSelected(true);

    if (
      subscriptionEnd &&
      isBefore(new Date(subscriptionEnd), new Date(slot.start))
    ) {
      setShowErrorModal(true);
      return;
    }

    const appointment: AppointmentState = {
      last_automated_call: null,
      canvas_appointment_id: null,
      encounter_type: 'Scheduled',
      appointment_type: 'Provider',
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
      status: 'Confirmed',
      duration: visitDuration,
      description: `Psychiatric Follow up`,
      daily_room: '',
      onsched_appointment_id: '',
    };

    addAppointment(appointment);
    setShowModal(true);
  }

  async function handleScheduleAppointment() {
    if (!appointment) return;
    setCreatingAppointment(true);

    await createAppointment(
      {
        type: appointment.encounter_type,
        appointment_type: appointment.appointment_type,
        provider: appointment.provider!,
        starts_at: appointment.starts_at!,
        ends_at: appointment.ends_at!,
        status: appointment.status,
        duration: appointment.duration,
        care: SpecificCareOption.ANXIETY_OR_DEPRESSION,
      },
      patient!
    )
      .then(async () => {
        setCreatingAppointment(false);
        setIsSlotSelected(false);
        if (Router.pathname.includes('patient-portal')) {
          Router.replace(Pathnames.PATIENT_PORTAL_VISIT_CONFIRMATION);
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
                style={{ objectFit: 'cover' }}
                src={
                  practitioner.clinician.profiles.avatar_url ||
                  ProfilePlaceholder
                }
                width="200"
                height="200"
                alt="image of a care provider"
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
            <Typography textAlign="center" color="#777777">
              {'Zealthy Mental Health Provider'}
            </Typography>
          </Grid>
        </Grid>
        <Box sx={{ height: 'auto', overflow: 'hidden' }}>
          <AvailableTimeSlots
            slots={slots || {}}
            handleSelectAppointment={handleSelectAppointment}
            isSlotSelected={isSlotSelected}
          />
        </Box>
        <Modal open={showErrorModal}>
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
            <Typography variant="h3">Unable to schedule this visit</Typography>
            <Stack width="100%" gap="1rem">
              {subscriptionEnd ? (
                <Typography mb="1rem">
                  Your Personalized Psychiatry subscription is scheduled to end
                  on {format(new Date(subscriptionEnd || ''), 'MMMM do, yyyy')}
                  . Visits cannot be scheduled for after the end of your
                  subscription.
                  <br />
                  <br />
                  Please resubscribe or select an earlier appointment.
                </Typography>
              ) : null}
              <Button fullWidth onClick={() => setShowErrorModal(false)}>
                Got it
              </Button>
            </Stack>
          </Stack>
        </Modal>
        <Modal
          open={showModal && !!appointment?.provider}
          onClose={() => {
            setShowModal(false);
            setIsSlotSelected(false);
          }}
        >
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
            <Typography variant="h4">Confirm this session</Typography>
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
                onClick={() => {
                  setShowModal(false);
                  setIsSlotSelected(false);
                }}
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
