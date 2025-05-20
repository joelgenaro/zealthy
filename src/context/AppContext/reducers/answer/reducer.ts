import { AnswerAction, AnswerActionsType, AnswerState } from '../types/answer';
import { IAppState } from '../types/appState';
import { CommonActionTypes } from '../types/common';

export const initialAnswerState: AnswerState = {};

const answerReducer = (
  state: AnswerState,
  action: AnswerAction
): AnswerState => {
  switch (action.type) {
    case CommonActionTypes.INIT:
      return {
        ...(action.payload as IAppState).answer,
      };
    case AnswerActionsType.SET_ANSWERS:
      return {
        ...action.payload,
      };
    case CommonActionTypes.RESET:
      return {};
    case AnswerActionsType.ADD_ANSWER:
      return {
        ...state,
        [action.payload.name]: action.payload,
      };
    case AnswerActionsType.REMOVE_ANSWERS:
      const newState = action.payload.reduce((acc, item) => {
        delete acc[item];
        return acc;
      }, state);

      return newState;
    case AnswerActionsType.CLEAR_ANSWERS:
      return {};
    default:
      return state;
  }
};

export default answerReducer;
