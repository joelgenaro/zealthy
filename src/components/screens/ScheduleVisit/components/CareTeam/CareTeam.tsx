import Router from 'next/router';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import HealthCheckupLoading from '@/components/shared/Loading/HealthCheckupLoading';

import {
  PractitionerWithSchedule,
  useProviderSchedule,
} from '@/components/hooks/useProviderSchedule';
import {
  useAppointmentAsync,
  useAppointmentSelect,
} from '@/components/hooks/useAppointment';
import { useInsuranceState } from '@/components/hooks/useInsurance';
import { Pathnames } from '@/types/pathnames';
import { CanvasSlot } from '@/components/shared/AvailableTimeSlots';
import { usePatient } from '@/components/hooks/data';
const ProviderSchedule = dynamic(
  () => import('@/components/shared/ProviderSchedule'),
  { ssr: false }
);

interface Props {
  show?: boolean;
}

const CareTeam = ({ show = true }: Props) => {
  const { data: patient } = usePatient();
  const [hasSlots, setHasSlots] = useState<boolean>(false);
  const [appointmentSelected, setAppointmentSelected] =
    useState<boolean>(false);
  const [isSlotSelected, setIsSlotSelected] = useState<boolean>(false);
  const { hasINInsurance } = useInsuranceState();
  const { practitioners, loading } = useProviderSchedule({
    type: 'Provider',
    duration: hasINInsurance ? 45 : 30,
  });

  const { createAppointment } = useAppointmentAsync();
  const appointment = useAppointmentSelect(appointments =>
    appointments.find(a => a.appointment_type === 'Provider')
  );

  const showCareTeam = hasSlots && !loading;

  useEffect(() => {
    if (appointmentSelected && appointment) {
      Router.push(Pathnames.CONFIRM_VISIT);
    }
  }, [appointmentSelected, appointment]);

  const handleScheduleAppointment = useCallback(
    async (slot: CanvasSlot, practitioner: PractitionerWithSchedule) => {
      if (isSlotSelected) return;
      setIsSlotSelected(true);
      await createAppointment(
        {
          type: 'Scheduled',
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
          duration: hasINInsurance ? 45 : 30,
        },
        patient!
      );

      setAppointmentSelected(true);
    },
    [createAppointment, hasINInsurance, isSlotSelected, patient]
  );

  if (!show) return null;

  return (
    <Grid container direction="column" gap="33px" alignItems="center">
      {!showCareTeam && <HealthCheckupLoading />}
      {practitioners &&
        practitioners.map((p, i) => (
          <ProviderSchedule
            index={i}
            specialties={p?.clinician.specialties!}
            key={p?.clinician.id}
            practitioner={p}
            setHasSlots={setHasSlots}
            onSelect={handleScheduleAppointment}
            isSlotSelected={isSlotSelected}
          />
        ))}
    </Grid>
  );
};

export default CareTeam;
