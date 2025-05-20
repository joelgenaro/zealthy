import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo } from 'react';
import { useAllVisiblePatientSubscription } from '@/components/hooks/data';
import { Subscription } from './types';
import PatientActiveMembership from './components/PatientActiveMembership';
import PatientScheduledForCancelationMembership from './components/PatientScheduledForCancelationMembership';
import PatientCanceledMembership from './components/PatientCanceledMembership';
import MembersHelpCenterCard from './components/MembersHelpCenterCard';

interface PatientMembershipsProps {
  onSelect: (sub: Subscription) => void;
  onSubscriptionLoad: (hasExpiredSubscription: boolean) => void;
}

const PatientMemberships = ({
  onSelect,
  onSubscriptionLoad,
}: PatientMembershipsProps) => {
  const { data: patientSubscriptions = [], refetch } =
    useAllVisiblePatientSubscription();

  const activeIshMemberships = useMemo(() => {
    return patientSubscriptions.filter(
      s =>
        s.subscription_id !== 5 &&
        !['canceled', 'scheduled_for_cancelation'].includes(s.status)
    );
  }, [patientSubscriptions]);

  const scheduleForCancelationMemberships = useMemo(() => {
    const canceled = patientSubscriptions.filter(
      s => s.subscription_id !== 5 && s.status === 'scheduled_for_cancelation'
    );
    return canceled.filter(
      c =>
        !activeIshMemberships.find(a => a.subscription_id === c.subscription_id)
    );
  }, [patientSubscriptions, activeIshMemberships]);

  const canceledSubscriptions = useMemo(() => {
    const canceled = patientSubscriptions.filter(
      s => s.subscription_id !== 5 && s.status === 'canceled'
    );
    return canceled.filter(
      c =>
        !activeIshMemberships.find(a => a.subscription_id === c.subscription_id)
    );
  }, [patientSubscriptions, activeIshMemberships]);

  const weightLossSubs = patientSubscriptions?.filter(s =>
    s.subscription.name.includes('Weight Loss')
  );

  const bundle =
    !!weightLossSubs?.find(s => s?.price === 449) ||
    !!weightLossSubs?.find(s => s?.price === 297) ||
    !!weightLossSubs?.find(s => s?.price === 249);

  useEffect(() => {
    if (
      patientSubscriptions.find(
        s =>
          s.subscription_id !== 5 &&
          ['canceled', 'scheduled_for_cancelation'].includes(s.status)
      )
    ) {
      onSubscriptionLoad(true);
    } else {
      onSubscriptionLoad(false);
    }
  }, [patientSubscriptions, onSubscriptionLoad]);

  return (
    <Stack gap="16px">
      <Typography
        variant="h3"
        sx={{
          fontSize: '18px !important',
          fontWeight: '600',
          lineHeight: '26px !important',
          display: 'flex',
          alignItems: 'flex-start',
        }}
      >
        {'Membership'}
      </Typography>

      {canceledSubscriptions.map(sub => (
        <PatientCanceledMembership
          onSelect={onSelect}
          key={sub.reference_id}
          subscription={sub}
          refetchSubscription={refetch}
        />
      ))}

      {scheduleForCancelationMemberships.map(sub => (
        <PatientScheduledForCancelationMembership
          key={sub.reference_id}
          subscription={sub}
          onSelect={onSelect}
          refetchSubscription={refetch}
        />
      ))}

      {activeIshMemberships.map(sub => (
        <PatientActiveMembership
          key={sub.reference_id}
          subscription={sub}
          onSelect={onSelect}
        />
      ))}

      {weightLossSubs.length > 0 && !bundle ? <MembersHelpCenterCard /> : null}

      {patientSubscriptions.length ? null : (
        <Typography variant="subtitle1">No memberships</Typography>
      )}
    </Stack>
  );
};

export default PatientMemberships;
