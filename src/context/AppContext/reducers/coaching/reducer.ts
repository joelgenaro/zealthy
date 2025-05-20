import { IAppState } from '../types/appState';
import {
  CoachingActions,
  CoachingActionTypes,
  CoachingState,
} from '../types/coaching';
import { CommonActionTypes } from '../types/common';

export const initialCoachingState: CoachingState[] = [];

const coachingReducer = (
  state: CoachingState[],
  action: CoachingActions
): CoachingState[] => {
  switch (action.type) {
    case CommonActionTypes.INIT:
      return [...(action.payload as IAppState).coaching];
    case CommonActionTypes.RESET:
      return [];
    case CoachingActionTypes.CLEAR_COACHING:
      return [];
    case CoachingActionTypes.ADD_COACHING:
      return state
        .filter(c => c.planId !== action.payload.planId)
        .concat(action.payload);
    case CoachingActionTypes.REMOVE_COACHING:
      return state.filter(c => c.type !== action.payload);
    default:
      return state;
  }
};

export default coachingReducer;
