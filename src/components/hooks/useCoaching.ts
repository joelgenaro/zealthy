import { useAppDispatchContext } from '@/context/AppContext';
import { getCoachingActions } from '@/context/AppContext/reducers/coaching/actions';
import { useMemo } from 'react';

export const useCoachingActions = () => {
  const dispatch = useAppDispatchContext();

  const dispatchBoundActions = useMemo(
    () => getCoachingActions(dispatch),
    [dispatch]
  );

  return dispatchBoundActions;
};
