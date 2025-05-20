import { Dispatch } from 'react';
import {
  AnswerAction,
  AnswerActionsType,
  AnswerItem,
  AnswerState,
} from '../types/answer';

export const getAnswerActions = (dispatch: Dispatch<AnswerAction>) => ({
  setAnswers: (payload: AnswerState) =>
    dispatch({
      type: AnswerActionsType.SET_ANSWERS,
      payload,
    }),
  removeAnswers: (payload: string[]) =>
    dispatch({
      type: AnswerActionsType.REMOVE_ANSWERS,
      payload,
    }),
  submitAnswer: (payload: AnswerItem) =>
    dispatch({
      type: AnswerActionsType.ADD_ANSWER,
      payload,
    }),
  clearAnswers: () =>
    dispatch({
      type: AnswerActionsType.CLEAR_ANSWERS,
    }),
});
