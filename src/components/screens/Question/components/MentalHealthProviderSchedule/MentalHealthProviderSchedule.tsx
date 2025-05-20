import { usePatient, usePatientAppointments } from '@/components/hooks/data';
import { useAppointmentAsync } from '@/components/hooks/useAppointment';
import { useCoachingActions } from '@/components/hooks/useCoaching';
import { useFetchSubscription } from '@/components/hooks/useFetchSubscription';
import { useInsuranceState } from '@/components/hooks/useInsurance';
import {
  PractitionerWithSchedule,
  useProviderSchedule,
} from '@/components/hooks/useProviderSchedule';
import { CanvasSlot } from '@/components/shared/AvailableTimeSlots';
import Loading from '@/components/shared/Loading/Loading';
import ProviderSchedule from '@/components/shared/ProviderSchedule';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import { Container, Grid, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface MentalHealthScheduleProps {
  onSelect: (nextPage: string | undefined) => void;
}

const MentalHealthProviderSchedule = ({
  onSelect,
}: MentalHealthScheduleProps) => {
  const { data: patient } = usePatient();
  const name = 'Zealthy Personalized Psychiatry';
  const subscription = useFetchSubscription(name);
  const { createAppointment } = useAppointmentAsync();
  const { hasINInsurance } = useInsuranceState();
  const duration = hasINInsurance ? 45 : 30;
  const { loading, practitioners } = useProviderSchedule({
    type: 'Provider',
    duration,
    exclude_providers: [],
  });
  const { addCoaching } = useCoachingActions();
  const [isSlotSelected, setIsSlotSelected] = useState<boolean>(false);

  const sortedPractitioners = useMemo(() => {
    if (!practitioners.length) {
      return [];
    }

    const now = new Date().getTime();
    const twoHoursFromNow = now + 2 * 60 * 60 * 1000;

    const rest = practitioners.filter(
      p => !p.clinician.type?.includes('Provider (PMHNP)')
    );

    const psychiatryOnly = practitioners.filter(p =>
      p.clinician.type?.includes('Provider (PMHNP)')
    );

    const getEarliestStartTime = (
      practitioner: (typeof practitioners)[0]
    ): number => {
      const upcomingSchedules = practitioner.schedule.filter(
        (slot: any) => new Date(slot.start).getTime() >= twoHoursFromNow
      );
      const firstSchedule = upcomingSchedules[0];
      return firstSchedule ? new Date(firstSchedule.start).getTime() : Infinity;
    };

    const sorted = psychiatryOnly
      .concat(rest)
      .sort((a, b) => getEarliestStartTime(a) - getEarliestStartTime(b));

    return sorted;
  }, [practitioners]);

  useEffect(() => {
    if (subscription) {
      addCoaching({
        type: CoachingType.PERSONALIZED_PSYCHIATRY,
        name: 'Zealthy Personalized Psychiatry',
        id: subscription?.id,
        planId: subscription?.reference_id,
        recurring: { interval: 'month', interval_count: 1 },
        price: subscription?.price,
        discounted_price: 39,
      });
    }
  }, [addCoaching, subscription]);

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
          description: name,
        },
        patient!
      );
      onSelect(undefined);
    },
    [createAppointment, duration, onSelect, isSlotSelected]
  );

  return (
    <Container maxWidth="lg">
      <Grid container direction="column" gap="48px">
        <Typography variant="h2">Please schedule your remote visit.</Typography>

        <Grid container direction="column" gap="33px" alignItems="center">
          {loading && <Loading />}
          {sortedPractitioners
            .map(p => ({
              ...p,
              specialties: 'Zealthy Mental Health Provider',
            }))
            .map((p, i) => (
              <ProviderSchedule
                index={i}
                specialties={p.specialties}
                key={p.clinician.id}
                practitioner={p}
                onSelect={handleScheduleAppointment}
                hideBios={true}
                isSlotSelected={isSlotSelected}
              />
            ))}
        </Grid>
      </Grid>
    </Container>
  );
};

export default MentalHealthProviderSchedule;
