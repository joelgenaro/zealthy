import Router from 'next/router';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import HealthCheckupLoading from '@/components/shared/Loading/HealthCheckupLoading';

import { PractitionerWithSchedule } from '@/components/hooks/useProviderSchedule';
import {
  useAppointmentAsync,
  useAppointmentSelect,
} from '@/components/hooks/useAppointment';
import { CanvasSlot } from '@/components/shared/AvailableTimeSlots';
import { useSpecificProviderSchedule } from '@/components/hooks/useSpecificProviderSchedule';
import router from 'next/router';
import { usePatient } from '@/components/hooks/data';

const ProviderSchedule = dynamic(
  () => import('@/components/shared/ProviderSchedule'),
  { ssr: false }
);

interface Props {
  clinician: number;
  duration: number;
}

const SpecificCareTeam = ({ clinician, duration }: Props) => {
  const { id } = router.query;
  const { data: patient } = usePatient();
  const { loading, practitioners } = useSpecificProviderSchedule(
    clinician,
    duration
  );
  const [appointmentSelected, setAppointmentSelected] =
    useState<boolean>(false);

  const [isSlotSelected, setIsSlotSelected] = useState<boolean>(false);

  const { createAppointment } = useAppointmentAsync();
  const appointment = useAppointmentSelect(appointments =>
    appointments.find(a => a.appointment_type === 'Provider')
  );

  useEffect(() => {
    if (appointmentSelected && appointment) {
      Router.push('/schedule-now/confirm?id=' + id);
    }
  }, [appointmentSelected, appointment, id]);

  const handleScheduleAppointment = useCallback(
    async (slot: CanvasSlot, practitioner: PractitionerWithSchedule) => {
      if (isSlotSelected) return;
      setIsSlotSelected(true);

      await createAppointment(
        {
          type: 'Scheduled',
          visit_type: 'Video',
          appointment_type: 'Provider',
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
          status: 'Requested',
          duration: duration || 15,
        },
        patient!
      );

      setAppointmentSelected(true);
    },
    [createAppointment, duration, isSlotSelected]
  );

  return (
    <Grid container direction="column" gap="33px" alignItems="center">
      {loading ? (
        <HealthCheckupLoading text="Just a moment! We're finding available appointments." />
      ) : (
        practitioners?.map((p, i) => (
          <ProviderSchedule
            index={i}
            specialties={p?.clinician.specialties!}
            key={p?.clinician.canvas_practitioner_id}
            practitioner={p}
            onSelect={handleScheduleAppointment}
            isSlotSelected={isSlotSelected}
          />
        ))
      )}
    </Grid>
  );
};

export default SpecificCareTeam;
