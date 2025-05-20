import { usePatient } from '@/components/hooks/data';
import { useAppointmentAsync } from '@/components/hooks/useAppointment';
import {
  PractitionerWithSchedule,
  useProviderSchedule,
} from '@/components/hooks/useProviderSchedule';
import { useSelector } from '@/components/hooks/useSelector';
import AppointmentConfirmationModal from '@/components/shared/AppointmentConfirmationModal';
import { CanvasSlot } from '@/components/shared/AvailableTimeSlots';
import ErrorMessage from '@/components/shared/ErrorMessage';
import Loading from '@/components/shared/Loading/Loading';
import ProviderSchedule from '@/components/shared/ProviderSchedule';
import { AppointmentState } from '@/context/AppContext/reducers/types/appointment';
import Grid from '@mui/material/Grid';
import { useCallback, useState } from 'react';

interface CareTeamProps {
  onSelect: (nextPage: string | undefined) => void;
}

const CareTeam = ({ onSelect }: CareTeamProps) => {
  const [error, setError] = useState('');
  const { data: patient } = usePatient();
  const [appointment, setAppointment] = useState<AppointmentState | null>(null);
  const {
    id: appointment_id,
    description,
    duration,
    canvas_appointment_id,
    payer_name,
    location,
  } = useSelector(
    store => store.appointment.find(a => a.appointment_type === 'Provider')!
  );
  const { createAppointment, updateAppointment } = useAppointmentAsync();
  const [showModal, setShowModal] = useState(false);
  const { loading, practitioners } = useProviderSchedule({
    type: 'Provider',
    duration,
  });
  const [isSlotSelected, setIsSlotSelected] = useState<boolean>(false);

  const handleSelectedAppointment = useCallback(
    (slot: CanvasSlot, practitioner: PractitionerWithSchedule) => {
      if (isSlotSelected) return;
      setIsSlotSelected(true);

      setAppointment({
        last_automated_call: null,
        canvas_appointment_id: canvas_appointment_id,
        encounter_type: 'Scheduled',
        appointment_type: 'Provider',
        id: appointment_id,
        visit_type: null,
        location: location,
        payer_name: payer_name,
        provider: {
          id: practitioner?.clinician?.id,
          first_name: practitioner?.clinician?.profiles.first_name,
          last_name: practitioner?.clinician.profiles.last_name,
          avatar_url: practitioner?.clinician.profiles.avatar_url,
          specialties: practitioner?.clinician.specialties,
          zoom_link: practitioner?.clinician.zoom_link,
          daily_room: practitioner?.clinician.daily_room,
          canvas_practitioner_id:
            practitioner?.clinician.canvas_practitioner_id,
          email: practitioner?.clinician.profiles.email,
          onsched_resource_id:
            practitioner?.clinician?.profiles?.onsched_resource_id,
        },
        starts_at: slot.start,
        ends_at: slot.end,
        status: 'Confirmed',
        duration,
        description,
        daily_room: '',
        onsched_appointment_id: '',
      });

      setShowModal(true);
      setError('');
    },
    [
      appointment_id,
      canvas_appointment_id,
      description,
      duration,
      isSlotSelected,
      location,
      payer_name,
    ]
  );

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

  const handleConfirmedAppointment = useCallback(
    async (appointment: NonNullable<AppointmentState>) => {
      await createAppointment(
        {
          type: 'Scheduled',
          appointment_type: 'Provider',
          provider: {
            id: appointment?.provider?.id!,
            first_name: appointment?.provider?.first_name!,
            last_name: appointment?.provider?.last_name!,
            avatar_url: appointment?.provider?.avatar_url!,
            specialties: appointment?.provider?.specialties!,
            zoom_link: appointment?.provider?.zoom_link!,
            daily_room: appointment?.provider?.daily_room!,
            canvas_practitioner_id: null,
            email: appointment?.provider?.email!,
            onsched_resource_id: appointment?.provider?.onsched_resource_id!,
          },
          starts_at: appointment?.starts_at!,
          ends_at: appointment.ends_at!,
          status: 'Requested',
          duration,
        },
        patient!
      );

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
    [onSelect, updateAppointment, patient, createAppointment, duration]
  );

  const handleSelection = useCallback(async () => {
    if (!appointment) return;

    if (appointment.id) {
      await handleRescheduleAppointment(appointment);
    } else {
      await handleConfirmedAppointment(appointment);
    }
  }, [appointment, handleConfirmedAppointment, handleRescheduleAppointment]);

  return (
    <>
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
      <Grid container direction="column" gap="33px" alignItems="center">
        {loading && <Loading />}
        {practitioners.map((p, i) => (
          <ProviderSchedule
            index={i}
            specialties={p.clinician.specialties!}
            key={p.clinician.id}
            practitioner={p}
            onSelect={handleSelectedAppointment}
            isSlotSelected={isSlotSelected}
          />
        ))}
        <AppointmentConfirmationModal
          title="Confirm appointment"
          open={showModal && !!appointment}
          appointment={appointment!}
          onClose={() => setShowModal(false)}
          onConfirm={handleSelection}
        />
      </Grid>
    </>
  );
};

export default CareTeam;
