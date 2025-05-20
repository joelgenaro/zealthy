import { IAppState } from '../types/appState';
import { CommonActionTypes } from '../types/common';
import { FlowActions, FlowActionsType, FlowState } from '../types/flow';

export const initialFlowState: FlowState = {
  currentFlow: null,
};

const flowReducer = (state: FlowState, action: FlowActions): FlowState => {
  switch (action.type) {
    case CommonActionTypes.INIT:
      return {
        ...(action.payload as IAppState).flow,
      };
    case FlowActionsType.SET_FLOW:
      return {
        currentFlow: action.payload,
      };
    case FlowActionsType.CLEAR_FLOW:
      return { currentFlow: null };
    default:
      return state;
  }
};

export default flowReducer;
