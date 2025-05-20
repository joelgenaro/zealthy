import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Button,
  Modal,
  Stack,
} from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import axios from 'axios';
import { useInsuranceState } from '@/components/hooks/useInsurance';
import { CareSelectionMapping } from '@/types/careSelection';
import Router from 'next/router';
import VisitConfirmation from '../VisitConfirmation';
import { useVisitState } from '@/components/hooks/useVisit';
import VisitSummary from '@/components/shared/VisitSummary';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import {
  ClinicianProps,
  useAllVisiblePatientSubscription,
  usePatient,
} from '@/components/hooks/data';
import {
  useAppointmentAsync,
  useAppointmentCare,
} from '@/components/hooks/useAppointment';
import { PractitionerWithSchedule } from '@/components/hooks/useProviderSchedule';
import { addHours, format, isBefore, isValid, parseISO } from 'date-fns';
import Loading from '@/components/shared/Loading/Loading';
import { CalendarPicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

type Profile = Database['public']['Tables']['profiles']['Row'];

type CanvasSlot = {
  start: string;
  end: string;
  day: string;
};
type SlotResponse = {
  day: {
    resource: CanvasSlot;
  }[];
};

type SlotsByDay = {
  [key: string]: CanvasSlot[];
};

type Practitioner = {
  starts_at: string;
  ends_at: string;
  canvas_practitioner_id: string;
  zoom_link: string;
  daily_room: string;
  bio: string;
  schedule: string;
  profiles: Profile;
  specialties: string;
  type: string[];
  id: number;
};

type Provider = {
  first_name: string | null | undefined;
  last_name: string | null | undefined;
  specialties: string | null | undefined;
  avatar_url: string | null | undefined;
};
interface VisitProps {
  care?: string | null;
  canvas_appointment_id: string | null | undefined;
  starts_at: string | null | undefined;
  ends_at: string | null | undefined;
  duration: number | null | undefined;
  description: string | null | undefined;
  appointment_type: string | null | undefined;
  provider: Provider | null | undefined;
  id?: number;
  daily_room?: string | null | undefined;
}
interface AppointmentProps {
  id: number;
  starts_at: string;
  ends_at: string;
  appointment_type: string | null | undefined;
  duration: number | null | undefined;
  description: string | null | undefined;
  canvas_appointment_id: string | null | undefined;
  care?: string | null;
  clinician: {
    specialties: string;
    profiles: {
      first_name: string;
      last_name: string;
      avatar_url: string;
    };
  };
}
const parseCanvasTimeSlot = (acc: SlotsByDay, slot: CanvasSlot) => {
  const day = slot.day;
  if (!acc[day]) {
    acc[day] = [];
  }

  acc[day].push(slot);

  return acc;
};

const parseAndValidateDate = (dateString: string | undefined | null) => {
  if (!dateString) return null;
  const date = parseISO(dateString);
  return isValid(date) ? date : null;
};

export default function ScheduleAppointment() {
  const supabase = useSupabaseClient<Database>();
  const visit = useVisitState();
  const { selectedCare } = visit;
  const { hasINInsurance, payer } = useInsuranceState();
  const { data: patientInfo } = usePatient();
  const { createAppointment } = useAppointmentAsync();
  const careForAppointment = useAppointmentCare();
  const { data: visibleSubscriptions } = useAllVisiblePatientSubscription();
  const [practitioners, setPractitioners] = useState<
    PractitionerWithSchedule[] | null
  >(null);
  const [visitDuration, setVisitDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [slots, setSlots] = useState<SlotsByDay | null>(null);
  const [hideCard, setHideCard] = useState<boolean>(false);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [isPsychiatricAppointment, setIsPsychiatricAppointment] =
    useState<boolean>(false);
  const [isMore, setIsMore] = useState<boolean>(false);
  const [timeSlot, setTimeSlot] = useState<CanvasSlot | null>(null);
  const [clinician, setClinician] = useState<ClinicianProps | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reschedulingAppt, setReschedulingAppt] = useState<VisitProps | null>(
    null
  );
  const [createdApptId, setCreatedApptId] = useState<number | null>(null);
  const [page, setPage] = useState('home');
  const searchParams = useSearchParams();
  const practitionerId = searchParams?.get('id');
  const appointmentId = searchParams?.get('appt-id');

  const hasActivePsychiatry = visibleSubscriptions?.some(
    sub =>
      sub?.subscription?.id === 7 &&
      ['active', 'trialing', 'recreated'].includes(sub?.status)
  );

  const cancelledPsychiatry = visibleSubscriptions?.find(
    sub =>
      sub?.subscription?.id === 7 &&
      ['cancelled', 'canceled', 'scheduled_for_cancelation'].includes(
        sub?.status
      )
  );

  const psychiatrySubscriptionEnd =
    !hasActivePsychiatry && cancelledPsychiatry?.current_period_end;

  async function fetchClinician() {
    if (!practitionerId) {
      return;
    }
    const clinician = await supabase
      .from('clinician')
      .select(
        `id, zoom_link, daily_room, status, type, specialties, profiles(*)`
      )
      .eq('id', practitionerId)
      .single();
    setClinician(clinician.data as any);
  }

  const fetchSchedules = async () => {
    let clinicians: ClinicianProps[] = [];

    if (clinician?.type.includes('Provider')) {
      if (hasINInsurance && payer?.id) {
        const { data, error } = await supabase
          .from('state_payer_clinician')
          .select(
            'clinician(canvas_practitioner_id, zoom_link, daily_room, status, type, specialties, profiles(*)),state_payer(state,payer_id)'
          )
          .eq('active', true)
          .eq('state_payer.state', patientInfo?.region ?? '')
          .eq('state_payer.payer_id', payer.id)
          .returns<{ clinician: ClinicianProps; state_payer: any }[]>();

        if (error) {
          console.error('fetch_sched_err', error);
        }
        if (data) {
          clinicians = data.filter(d => d.state_payer).map(d => d.clinician);
        }
      } else {
        const { data, error } = await supabase
          .from('state_clinician')
          .select(
            'clinician(id, canvas_practitioner_id, zoom_link, daily_room, status, type, specialties, profiles(*))'
          )
          .match({
            state: patientInfo?.region,
            active: true,
            clinician_id: clinician.id,
          })
          .returns<{ clinician: ClinicianProps }[]>();

        if (error) {
          console.error('fetch_sched_err', error);
        }
        if (data) {
          clinicians = data.map(d => d.clinician);
        }
      }
    } else {
      clinicians = [clinician!];
    }

    if (clinicians) {
      const enabled_clinicians = clinicians
        .filter((d: any) => d.status === 'ON')
        .filter(
          c => c.id === clinician?.id && c?.profiles?.onsched_resource_id
        );

      const canvas_ids = enabled_clinicians.map(d => {
        return {
          clinician_id: d?.id,
          email: d.profiles.email,
          resourceId: d.profiles.onsched_resource_id,
        };
      });

      const schedules_by_practitioner = await axios.post(
        '/api/onsched/get-availability',
        {
          ids: canvas_ids,
          duration: visitDuration,
        }
      );

      setPractitioners(() =>
        Object.entries(schedules_by_practitioner.data).map(p => {
          return {
            clinician: clinicians?.find(c => c.profiles.email === p[0])!,
            schedule: p[1],
          };
        })
      );
    }
  };

  const fetchSlots = async () => {
    setLoading(true);

    if (practitioners?.[0].schedule) {
      const slotsByDay = practitioners?.[0]?.schedule.reduce(
        parseCanvasTimeSlot,
        {}
      );

      if (
        Object.keys(slotsByDay).length &&
        Object.keys(slotsByDay).some(key => !!slotsByDay[key].length)
      ) {
        setSlots(slotsByDay);
        setHideCard(false);
        setLoading(false);
        return;
      }

      return;
    } else {
      setHideCard(true);
    }

    setLoading(false);
  };

  async function requestAppointment() {
    setBooking(true);

    if (
      isPsychiatricAppointment &&
      psychiatrySubscriptionEnd &&
      isBefore(
        new Date(psychiatrySubscriptionEnd || ''),
        new Date(timeSlot?.start || '')
      )
    ) {
      setShowErrorModal(true);
      setBooking(false);
      return;
    }

    if (timeSlot === null) {
      setBooking(false);
      return alert('Need to select a time.');
    }

    try {
      const careSelections = selectedCare.careSelections?.reduce(
        (acc, c: any) => acc + CareSelectionMapping[c] + ' / ',
        ''
      );

      let care = reschedulingAppt?.care;
      if (!care) {
        care = await careForAppointment(patientInfo?.id!);
      }

      function isValidAppointmentType(
        type: any
      ): type is 'Provider' | 'Coach (Mental Health)' | 'Coach (Weight Loss)' {
        return [
          'Provider',
          'Coach (Mental Health)',
          'Coach (Weight Loss)',
        ].includes(type);
      }

      const appointmentType = isValidAppointmentType(
        reschedulingAppt?.appointment_type
      )
        ? reschedulingAppt?.appointment_type!
        : 'Provider';

      const { data: createEntryData, error: createEntryError } = await supabase
        .from('appointment')
        .insert({
          encounter_type: 'Scheduled',
          patient_id: patientInfo?.id ? patientInfo?.id : 0,
          clinician_id: clinician?.id,
          starts_at: timeSlot?.start,
          ends_at: timeSlot?.end,
          status: 'Confirmed',
          description: reschedulingAppt?.description,
          duration: visitDuration!,
          appointment_type: appointmentType,
          visit_type: null,
          location: patientInfo?.region || '',
          care,
        })
        .select()
        .single();

      if (createEntryError) {
        console.error(
          'Error creating appointment in Supabase:',
          createEntryError
        );
        throw new Error('Error creating appointment in Supabase');
      }

      if (!createEntryData || !createEntryData.id) {
        console.error('No data returned when creating appointment in Supabase');
        throw new Error('Failed to create appointment in Supabase');
      }

      setCreatedApptId(createEntryData.id || null);

      let onschedApptResponse;
      try {
        onschedApptResponse = await axios.post(
          `/api/onsched/create-appointment?completeBooking=BK`,
          {
            StartDateTime: timeSlot?.start,
            EndDateTime: timeSlot?.end,
            resourceId: clinician?.profiles?.onsched_resource_id,
            BookedBy: patientInfo?.profiles?.id,
            email: patientInfo?.profiles?.email,
            name: `${patientInfo?.profiles?.first_name} ${patientInfo?.profiles?.last_name}`,
          }
        );
      } catch (axiosError) {
        console.error('Error creating appointment in OnSched:', axiosError);
        throw new Error('Error creating appointment in OnSched');
      }

      if (
        !onschedApptResponse ||
        !onschedApptResponse.data ||
        !onschedApptResponse.data.id
      ) {
        console.error(
          'Invalid response from OnSched appointment creation:',
          onschedApptResponse
        );
        throw new Error('Invalid response from OnSched appointment creation');
      }

      const { error: updateError } = await supabase
        .from('appointment')
        .update({ onsched_appointment_id: onschedApptResponse.data.id })
        .eq('id', createEntryData.id);

      if (updateError) {
        console.error(
          'Error updating appointment with OnSched ID:',
          updateError
        );
        throw new Error('Error updating appointment with OnSched ID');
      }

      if (appointmentId) {
        const { data: oldAppointmentData, error: oldAppointmentError } =
          await supabase
            .from('appointment')
            .update({
              status: 'Cancelled',
              cancelation_reason: `Rescheduled with appointment: ${createEntryData.id}`,
              canceled_at: new Date().toISOString(),
            })
            .eq('id', appointmentId)
            .select(`*`)
            .single();

        if (oldAppointmentError) {
          console.error(
            'Error cancelling old appointment in Supabase:',
            oldAppointmentError
          );
          throw new Error('Error cancelling old appointment in Supabase');
        }

        try {
          const cancelOnSchedResponse = await axios.put(
            '/api/onsched/update-appointment',
            {
              appointmentId: oldAppointmentData?.onsched_appointment_id,
              action: 'cancel',
            }
          );

          if (cancelOnSchedResponse.status !== 200) {
            console.error(
              'Error cancelling appointment in OnSched:',
              cancelOnSchedResponse
            );
            throw new Error('Error cancelling appointment in OnSched');
          }
        } catch (axiosError) {
          console.error('Error cancelling appointment in OnSched:', axiosError);
          throw new Error('Error cancelling appointment in OnSched');
        }
      }

      setPage('confirmation');
    } catch (error) {
      console.error('Error in requestAppointment:', error);
      alert('An error occurred while requesting the appointment.');
    } finally {
      setBooking(false);
    }
  }

  async function fetchSingleAppointment() {
    if (!appointmentId) {
      return;
    }
    const reschedulingAppt = await supabase
      .from('appointment')
      .select(
        `*, clinician:clinician!inner(specialties, profiles!inner (first_name, last_name, avatar_url))`
      )
      .eq('id', appointmentId)
      .single()
      .then(({ data }) => data as AppointmentProps);

    if (reschedulingAppt) {
      const reschData: VisitProps = {
        care: reschedulingAppt.care,
        canvas_appointment_id: reschedulingAppt.canvas_appointment_id,
        starts_at: reschedulingAppt.starts_at,
        ends_at: reschedulingAppt.ends_at,
        appointment_type: reschedulingAppt.appointment_type || 'Provider',
        duration: reschedulingAppt.duration,
        description: reschedulingAppt.description,
        provider: {
          first_name: reschedulingAppt.clinician?.profiles?.first_name,
          last_name: reschedulingAppt.clinician?.profiles?.last_name,
          specialties: reschedulingAppt.clinician?.specialties,
          avatar_url: reschedulingAppt.clinician?.profiles?.avatar_url,
        },
      };
      setReschedulingAppt(reschData as VisitProps);
      setVisitDuration(reschedulingAppt?.duration || null);
      if (
        reschedulingAppt?.description
          ?.toLowerCase?.()
          .includes('psychiatric') ||
        reschedulingAppt?.description?.toLowerCase?.().includes('psychiatry')
      ) {
        setIsPsychiatricAppointment(true);
      }
    }
  }

  const checkDisableDate = (date: any) => {
    return slots
      ? !Object.keys(slots).includes(format(new Date(date), 'yyyy-MM-dd'))
      : true;
  };

  useEffect(() => {
    if (practitioners && patientInfo?.id && clinician !== null) {
      fetchSlots();
    }
  }, [practitioners, clinician, patientInfo?.id]);

  useEffect(() => {
    if (
      practitionerId &&
      patientInfo?.id &&
      clinician &&
      appointmentId &&
      reschedulingAppt
    ) {
      fetchSchedules();
    }

    if (practitionerId && patientInfo?.id && clinician && !appointmentId) {
      fetchSchedules();
    }
  }, [
    practitionerId,
    patientInfo?.id,
    clinician,
    appointmentId,
    reschedulingAppt?.canvas_appointment_id,
  ]);

  useEffect(() => {
    if (practitionerId) {
      fetchClinician();
    }
  }, [practitionerId]);

  useEffect(() => {
    if (appointmentId) {
      fetchSingleAppointment();
    } else {
      setVisitDuration(hasINInsurance ? 45 : 30);
    }
  }, [appointmentId]);

  return (
    <Container sx={{ maxWidth: '448px !important' }}>
      {page === 'home' && (
        <>
          <Typography
            component="h2"
            variant="h2"
            sx={{
              marginBottom: '48px',
            }}
          >
            {reschedulingAppt
              ? 'Reschedule Appointment.'
              : 'Schedule appointment.'}
          </Typography>
          {reschedulingAppt ? (
            <>
              <Box sx={{ marginBottom: '48px' }}>
                <VisitSummary appointment={reschedulingAppt} />
              </Box>
            </>
          ) : (
            <>
              <Box
                sx={{
                  display: 'flex',
                  borderRadius: '24px',
                  boxShadow: '0px 12px 24px 4px rgba(0, 0, 0, 0.04)',
                  border: '1px solid #E1E1E1',
                  background: '#FFFFFFF',
                  marginBottom: '44px',
                  padding: '32px',
                  alignItems: 'center',
                  textAlign: 'start',
                  gap: '1rem',
                }}
              >
                <Avatar
                  alt="provider_avatar"
                  src={clinician?.profiles?.avatar_url || ''}
                />
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <Typography
                    component="p"
                    variant="body1"
                    sx={{
                      weight: '500',
                      fontSize: '1rem !important',
                      color: '#1B1B1B',
                    }}
                  >
                    {`Dr. ${clinician?.profiles?.first_name} ${clinician?.profiles?.last_name}`}
                  </Typography>

                  <Typography sx={{ color: '#777777' }}>
                    {clinician?.specialties}
                  </Typography>
                </Box>
              </Box>
            </>
          )}
          <Typography component="h3" variant="h3" sx={{ marginBottom: '1rem' }}>
            {'Select new date and time:'}
          </Typography>
          {slots && (
            <Box
              sx={{
                button: {
                  backgroundColor: '#EBEBEB',
                  '&:disabled': {
                    backgroundColor: 'transparent',
                  },
                },
              }}
            >
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <CalendarPicker
                  onChange={(newValue: any) => {
                    setSelectedDate(new Date(newValue || ''));
                    setTimeSlot(null);
                  }}
                  disablePast
                  date={selectedDate}
                  shouldDisableDate={(date: any) => checkDisableDate(date)}
                />
              </LocalizationProvider>
            </Box>
          )}
          <Typography component="h3" variant="h3" sx={{ marginBottom: '1rem' }}>
            {`Available times for ${format(
              new Date(selectedDate),
              'EEEE, MMMM dd, yyyy'
            )}:`}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {loading ? (
              <Loading marginBottom="1rem" />
            ) : (
              slots?.hasOwnProperty(
                format(new Date(selectedDate || ''), 'yyyy-MM-dd')
              ) && (
                <>
                  {slots[format(new Date(selectedDate || ''), 'yyyy-MM-dd')]
                    .filter((slot: CanvasSlot) => {
                      const slotStartDate = parseAndValidateDate(slot?.start);
                      const currentDatePlusFourHours = addHours(new Date(), 4);

                      if (!slotStartDate) {
                        console.error('Invalid slot start date:', slot?.start);
                        return false;
                      }

                      return (
                        slotStartDate.getTime() >
                        currentDatePlusFourHours.getTime()
                      );
                    })
                    .map((slotTime, idx) => {
                      const slotTimeStartDate = parseAndValidateDate(
                        slotTime.start
                      );
                      const timeSlotStartDate = parseAndValidateDate(
                        timeSlot?.start
                      );

                      if (!slotTimeStartDate) {
                        console.error(
                          'Invalid slot time start date:',
                          slotTime.start
                        );
                        return null;
                      }

                      return (
                        (isMore || idx < 4) && (
                          <Box
                            key={`${idx}-${slotTime?.start}`}
                            sx={{
                              background:
                                slotTimeStartDate &&
                                timeSlotStartDate &&
                                format(slotTimeStartDate, 'h:mm a') ===
                                  format(timeSlotStartDate, 'h:mm a')
                                  ? '#91E5AC'
                                  : 'transparent',
                              flexBasis: 'calc(50% - 8px)',
                              borderRadius: '12px',
                              border: '1px solid #D8D8D8',
                              height: '52px',
                              padding: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                            onClick={() => setTimeSlot(slotTime)}
                          >
                            {format(slotTimeStartDate, 'h:mm a')}
                          </Box>
                        )
                      );
                    })}
                  <Box
                    component="button"
                    sx={{
                      background: 'transparent',
                      flexBasis: 'calc(100%)',
                      borderRadius: '12px',
                      border: '1px solid #D8D8D8',
                      height: '52px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1rem',
                      lineHeight: '24px',
                      letterSpacing: '0.02em',
                      color: '#1B1B1B',
                      marginBottom: '48px',
                    }}
                    onClick={() => setIsMore(more => !more)}
                  >
                    {!isMore ? 'View more' : 'View less'}
                  </Box>
                </>
              )
            )}
          </Box>
          <LoadingButton
            type="button"
            onClick={requestAppointment}
            loading={booking}
            sx={{ width: '100%', marginBottom: '1rem' }}
            disabled={timeSlot === null}
          >
            Confirm new appointment
          </LoadingButton>
          <Button
            type="button"
            sx={{
              width: '100%',
              marginBottom: '1rem',
              background: '#EBEBEB',
              color: '#1B1B1B',
              '&:hover': {
                background: 'grey !important',
              },
            }}
            onClick={() => Router.push('/patient-portal')}
          >
            Go back
          </Button>
        </>
      )}
      {page === 'confirmation' && (
        <VisitConfirmation
          appointment={{
            provider: {
              first_name: clinician?.profiles?.first_name,
              last_name: clinician?.profiles?.last_name,
              avatar_url: clinician?.profiles?.avatar_url,
              specialties: clinician?.specialties,
            },
            appointment_type: 'Provider',
            starts_at: timeSlot?.start,
            ends_at: timeSlot?.end,
          }}
          goBack={() => {
            setPage('home');
            Router.push(
              `schedule-appointment?id=${practitionerId}&appt-id=${createdApptId}`
            );
          }}
          goNext={() => Router.push('patient-portal')}
        />
      )}
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
            {psychiatrySubscriptionEnd ? (
              <Typography mb="1rem">
                Your Personalized Psychiatry subscription is scheduled to end on{' '}
                {format(
                  new Date(psychiatrySubscriptionEnd || ''),
                  'MMMM do, yyyy'
                )}
                . Visits cannot be scheduled for after the end of your
                subscription.
                <br />
                <br />
                Please resubscribe or select an earlier appointment.
              </Typography>
            ) : null}
            <Button
              fullWidth
              onClick={() => {
                setShowErrorModal(false);
                setBooking(false);
              }}
            >
              Got it
            </Button>
          </Stack>
        </Stack>
      </Modal>
    </Container>
  );
}
