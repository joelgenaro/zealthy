import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';
import { useMemo } from 'react';
import { useActivePatientSubscription } from './data';
import { useIntakeState } from './useIntake';
import { useSelector } from './useSelector';

export const useAddZealthySubscription = () => {
  const { potentialInsurance } = useIntakeState();
  const coaching = useSelector(store => store.coaching);
  const medications = useSelector(store => store.visit.medications);
  const isSync = useSelector(store => store.visit.isSync);
  const { data: activeSubscriptions = [] } = useActivePatientSubscription();

  const showZealthySubscription = useMemo(() => {
    if (activeSubscriptions.length) return false;
    if (potentialInsurance === PotentialInsuranceOption.BLUE_CROSS_ILLINOIS)
      return false;
    return coaching.length === 0 && medications.length === 0 && isSync;
  }, [activeSubscriptions.length, coaching.length, medications.length, isSync]);

  return showZealthySubscription;
};
