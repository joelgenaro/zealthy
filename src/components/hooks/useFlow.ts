import {
  useAppDispatchContext,
  useAppStateContext,
} from '@/context/AppContext';
import { getFlowActions } from '@/context/AppContext/reducers/flow/actions';
import { useMemo } from 'react';

export const useFlowActions = () => {
  const dispatch = useAppDispatchContext();
  const dispatchBoundActions = useMemo(
    () => getFlowActions(dispatch),
    [dispatch]
  );

  return dispatchBoundActions;
};

export const useFlowState = () => {
  const state = useAppStateContext();
  const flow = useMemo(() => state.flow, [state.flow]);
  return flow;
};
