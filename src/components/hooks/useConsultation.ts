import { useAppDispatchContext } from '@/context/AppContext';
import { getConsultationActions } from '@/context/AppContext/reducers/consultation/actions';
import { useMemo } from 'react';

export const useConsultationActions = () => {
  const dispatch = useAppDispatchContext();

  const dispatchBoundActions = useMemo(
    () => getConsultationActions(dispatch),
    [dispatch]
  );

  return dispatchBoundActions;
};
