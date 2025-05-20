import {
  useAppDispatchContext,
  useAppStateContext,
} from '@/context/AppContext';
import { getIntakeActions } from '@/context/AppContext/reducers/intake/actions';
import { IntakeState } from '@/context/AppContext/reducers/types/intake';
import { useMemo } from 'react';

export const useIntakeActions = () => {
  const dispatch = useAppDispatchContext();
  const dispatchBoundActions = useMemo(
    () => getIntakeActions(dispatch),
    [dispatch]
  );

  return dispatchBoundActions;
};

export const useIntakeState = () => {
  const state = useAppStateContext();
  const intake = useMemo(() => state.intake, [state.intake]);
  return intake;
};

export const useIntakeSelect = <T>(selector: (intake: IntakeState) => T) => {
  const intake = useIntakeState();

  return selector(intake);
};
