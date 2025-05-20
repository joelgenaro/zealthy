import { useMemo } from 'react';
import {
  useAllPatientPrescriptionRequest,
  useAllVisiblePatientSubscription,
} from './data';

function useIsFullyCancelled() {
  const { data: visibleSubscriptions = [] } =
    useAllVisiblePatientSubscription();
  const { data: prescriptionRequests = [] } =
    useAllPatientPrescriptionRequest();

  return useMemo(() => {
    if (!visibleSubscriptions.length && !prescriptionRequests.length) {
      return true;
    }

    const activeSubscriptions = visibleSubscriptions?.filter(subscription =>
      ['scheduled_for_cancelation', 'active'].includes(subscription.status)
    );

    if (!activeSubscriptions?.length && !prescriptionRequests.length) {
      return true;
    }

    if (
      !activeSubscriptions.length &&
      prescriptionRequests?.every(p => p.status === 'REJECTED')
    ) {
      return true;
    }

    return false;
  }, [prescriptionRequests, visibleSubscriptions]);
}

export default useIsFullyCancelled;
