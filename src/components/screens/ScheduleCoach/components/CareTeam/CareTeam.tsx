import { Grid } from '@mui/material';
import Loading from '@/components/shared/Loading/Loading';
import { CarePersonType, CoachType } from '@/types/carePersonType';
import {
  PractitionerWithSchedule,
  useProviderSchedule,
} from '@/components/hooks/useProviderSchedule';
import AppointmentConfirmationModal from '@/components/shared/AppointmentConfirmationModal';
import { AppointmentState } from '@/context/AppContext/reducers/types/appointment';
import { useCallback, useState } from 'react';
import { CanvasSlot } from '@/components/shared/AvailableTimeSlots';
import { useAppointmentAsync } from '@/components/hooks/useAppointment';
import ProviderSchedule from '@/components/shared/ProviderSchedule';
import { useSelector } from '@/components/hooks/useSelector';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { usePatient } from '@/components/hooks/data';

interface CareTeamProps {
  coachType: CoachType;
  onSelect: (nextPage: string | undefined) => void;
}

const CareTeam = ({ coachType, onSelect }: CareTeamProps) => {
  const [error, setError] = useState('');
  const { data: patient } = usePatient();

  const { createAppointment, updateAppointment } = useAppointmentAsync();
  const currentAppointment = useSelector(store =>
    store.appointment.find(a => a.appointment_type === coachType)
  );
  const [appointment, setAppointment] = useState<AppointmentState | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const duration = coachType == CarePersonType.MENTAL_HEALTH ? 45 : 15;
  const { loading, practitioners } = useProviderSchedule({
    type: coachType,
    duration,
  });
  const [isSlotSelected, setIsSlotSelected] = useState<boolean>(false);

  function handleSelectAppointment(
    slot: CanvasSlot,
    practitioner: PractitionerWithSchedule
  ) {
    if (isSlotSelected) return;
    setIsSlotSelected(true);

    setAppointment({
      last_automated_call: null,
      canvas_appointment_id: null,
      encounter_type: 'Scheduled',
      appointment_type: coachType,
      id: currentAppointment?.id || 0,
      visit_type: 'Video',
      location: currentAppointment?.location || '',
      payer_name: currentAppointment?.payer_name || '',
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
          practitioner?.clinician?.profiles?.onsched_resource_id!,
      },
      starts_at: slot.start,
      ends_at: slot.end,
      status: 'Requested',
      duration,
      description: `1:1 with ${coachType}`,
      daily_room: '',
      onsched_appointment_id: currentAppointment?.onsched_appointment_id || '',
    });
    setShowModal(true);
  }

  const handleRescheduleAppointment = useCallback(
    async (appointment: NonNullable<AppointmentState>) => {
      await updateAppointment(
        appointment.id,
        {
          encounter_type: appointment.encounter_type,
          appointment_type: appointment.appointment_type,
          clinician_id: appointment.provider?.id!,
          starts_at: appointment.starts_at!,
          ends_at: appointment.ends_at!,
          status: appointment.status,
          duration: appointment.duration,
        },
        patient!
      ).then(() => {
        onSelect(undefined);
      });
    },
    [onSelect, patient, updateAppointment]
  );

  const handleScheduleAppointment = useCallback(
    async (appointment: AppointmentState) => {
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
        .then(() => {
          onSelect(undefined);
        })
        .catch(error => {
          console.error('handle_sched_appt_careteam_err', error);
        });
    },
    [createAppointment, onSelect, patient]
  );

  const handleSelection = useCallback(async () => {
    if (!appointment) return;
    if (appointment.canvas_appointment_id) {
      await handleRescheduleAppointment(appointment);
    } else {
      await handleScheduleAppointment(appointment);
    }
  }, [appointment, handleRescheduleAppointment, handleScheduleAppointment]);

  return (
    <>
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
      <Grid container direction="column" gap="33px" alignItems="center">
        {loading && <Loading />}
        {practitioners.map((p, i) => (
          <ProviderSchedule
            index={i}
            specialties={p?.clinician.specialties!}
            key={p?.clinician.canvas_practitioner_id}
            practitioner={p}
            onSelect={handleSelectAppointment}
            isSlotSelected={isSlotSelected}
          />
        ))}
        <AppointmentConfirmationModal
          open={showModal && !!appointment}
          appointment={appointment!}
          title="Confirm coach selection and visit time"
          onClose={() => setShowModal(false)}
          onConfirm={handleSelection}
        />
      </Grid>
    </>
  );
};

export default CareTeam;
