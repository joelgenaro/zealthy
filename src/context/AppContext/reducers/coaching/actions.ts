import { Dispatch } from 'react';
import {
  CoachingActions,
  CoachingActionTypes,
  CoachingState,
  CoachingType,
} from '../types/coaching';

export const getCoachingActions = (dispatch: Dispatch<CoachingActions>) => ({
  addCoaching: (payload: CoachingState) => {
    console.log('xxx', payload);
    return dispatch({
      type: CoachingActionTypes.ADD_COACHING,
      payload,
    });
  },
  removeCoaching: (payload: CoachingType) =>
    dispatch({
      type: CoachingActionTypes.REMOVE_COACHING,
      payload,
    }),
  resetCoaching: () => dispatch({ type: CoachingActionTypes.CLEAR_COACHING }),
});
