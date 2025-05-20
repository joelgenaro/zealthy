import { Dispatch } from 'react';
import { Flow, FlowActions, FlowActionsType } from '../types/flow';

export const getFlowActions = (dispatch: Dispatch<FlowActions>) => ({
  setFlow: (payload: Flow) =>
    dispatch({
      type: FlowActionsType.SET_FLOW,
      payload,
    }),
  clearFlow: () =>
    dispatch({
      type: FlowActionsType.CLEAR_FLOW,
    }),
});
