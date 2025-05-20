import { useEffect, useState, useMemo } from 'react';
import { Grid } from '@mui/material';
import ProviderSchedule from '../ProviderSchedule';
import { useProviderSchedule } from '@/components/hooks/useProviderSchedule';
import HealthCheckupLoading from '@/components/shared/Loading/HealthCheckupLoading';
import {
  useAllVisiblePatientSubscription,
  useIsFirstAppointment,
} from '@/components/hooks/data';

const CareTeam = ({
  startTime,
  selectedPractitionerId,
}: {
  startTime: string;
  selectedPractitionerId: number | null;
}) => {
  const { data: visibleSubscriptions } = useAllVisiblePatientSubscription();
  const { data: isFirstAppointment } = useIsFirstAppointment(
    'Anxiety and depression'
  );

  const { loading, practitioners } = useProviderSchedule({
    type: 'Provider',
    duration: isFirstAppointment ? 30 : 15,
    starts_at: startTime,
  });
  const [showAll, setShowAll] = useState<boolean>(!selectedPractitionerId);

  const hasActivePsychiatry = visibleSubscriptions?.some(
    sub =>
      sub?.subscription?.id === 7 &&
      ['active', 'trialing', 'recreated'].includes(sub?.status)
  );

  const cancelledPsychiatry = visibleSubscriptions?.find(
    sub =>
      sub?.subscription?.id === 7 &&
      ['cancelled', 'canceled'].includes(sub?.status)
  );

  const subscriptionEnd =
    !hasActivePsychiatry && cancelledPsychiatry?.current_period_end;

  useEffect(() => {
    const selectedPractitioner = practitioners.find(
      p => p?.clinician.id === selectedPractitionerId
    );

    if (
      !loading &&
      !showAll &&
      !selectedPractitioner?.schedule?.entry?.length
    ) {
      setShowAll(true);
    }
  }, [loading, selectedPractitionerId, practitioners, showAll]);

  const sortedPractitioners = useMemo(() => {
    if (!practitioners.length) {
      return [];
    }

    const now = new Date().getTime();
    const twoHoursFromNow = now + 2 * 60 * 60 * 1000;

    const getEarliestStartTime = (
      practitioner: (typeof practitioners)[0]
    ): number => {
      const upcomingSchedules = practitioner.schedule.filter(
        (slot: any) => new Date(slot.start).getTime() >= twoHoursFromNow
      );
      const firstSchedule = upcomingSchedules[0];
      return firstSchedule ? new Date(firstSchedule.start).getTime() : Infinity;
    };

    const sorted = practitioners.sort(
      (a, b) => getEarliestStartTime(a) - getEarliestStartTime(b)
    );

    return sorted;
  }, [practitioners]);

  if (loading)
    return (
      <HealthCheckupLoading text="Just a moment - we’re finding available appointments!" />
    );

  return (
    <>
      <Grid container direction="column" gap="33px" alignItems="center">
        {!showAll &&
          startTime &&
          selectedPractitionerId &&
          practitioners.find(
            p => p.clinician.id === selectedPractitionerId
          ) && (
            <ProviderSchedule
              key={selectedPractitionerId}
              subscriptionEnd={subscriptionEnd || ''}
              practitioner={
                practitioners.find(
                  p => p.clinician.id === selectedPractitionerId
                )!
              }
            />
          )}

        {showAll &&
          sortedPractitioners.map(p => (
            <ProviderSchedule
              key={p.clinician.id}
              practitioner={p}
              subscriptionEnd={subscriptionEnd || ''}
            />
          ))}
      </Grid>
    </>
  );
};

export default CareTeam;
