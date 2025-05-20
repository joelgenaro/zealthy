import { usePatient } from '@/components/hooks/data';
import { useAppointmentAsync } from '@/components/hooks/useAppointment';
import { useInsuranceState } from '@/components/hooks/useInsurance';
import { useIntakeState } from '@/components/hooks/useIntake';
import {
  PractitionerWithSchedule,
  useProviderSchedule,
} from '@/components/hooks/useProviderSchedule';
import { CanvasSlot } from '@/components/shared/AvailableTimeSlots';
import HealthCheckupLoading from '@/components/shared/Loading/HealthCheckupLoading';
import ProviderSchedule from '@/components/shared/ProviderSchedule';
import { Pathnames } from '@/types/pathnames';
import { Container, Grid, Typography } from '@mui/material';
import Router from 'next/router';
import { useCallback, useState } from 'react';

interface PrimaryCareScheduleProps {
  onSelect: (nextPage: string | undefined) => void;
}

const PrimaryCareProviderSchedule = ({
  onSelect,
}: PrimaryCareScheduleProps) => {
  const { data: patient } = usePatient();
  const { createAppointment } = useAppointmentAsync();
  const { hasINInsurance } = useInsuranceState();
  const duration = hasINInsurance ? 45 : 30;
  const { loading, practitioners } = useProviderSchedule({
    type: 'Provider',
    duration,
  });
  const { potentialInsurance } = useIntakeState();
  const [isSlotSelected, setIsSlotSelected] = useState<boolean>(false);

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
          duration,
        },
        patient!
      );

      window.VWO?.event('appointmentRequestedPrimaryCare');

      potentialInsurance === 'Weight Loss Sync'
        ? Router.push(Pathnames.WHAT_NEXT)
        : onSelect(undefined);
    },
    [
      createAppointment,
      duration,
      onSelect,
      potentialInsurance,
      isSlotSelected,
      patient,
    ]
  );

  return (
    <Container maxWidth="lg">
      <Grid container direction="column" gap="48px">
        <Typography variant="h2">Please schedule your remote visit.</Typography>

        <Grid container direction="column" gap="33px" alignItems="center">
          {loading ? (
            <HealthCheckupLoading />
          ) : (
            practitioners.map((p, i) => (
              <ProviderSchedule
                index={i}
                specialties={p.clinician.specialties!}
                key={p.clinician.id}
                practitioner={p}
                onSelect={handleScheduleAppointment}
                hideBios={true}
                isSlotSelected={isSlotSelected}
              />
            ))
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default PrimaryCareProviderSchedule;
