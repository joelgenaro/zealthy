import { IAppState } from '../types/appState';
import { CommonActionTypes } from '../types/common';
import {
  ConsultationActions,
  ConsultationActionTypes,
  ConsultationState,
} from '../types/consultation';

export const initialConsultationState: ConsultationState[] = [];

const consultationReducer = (
  state: ConsultationState[],
  action: ConsultationActions
): ConsultationState[] => {
  switch (action.type) {
    case CommonActionTypes.INIT:
      return [...(action.payload as IAppState).consultation];
    case CommonActionTypes.RESET:
      return [];
    case ConsultationActionTypes.ADD_CONSULTATION:
      return state
        .filter(item => item.type !== action.payload.type)
        .concat(action.payload);
    case ConsultationActionTypes.REMOVE_CONSULTATION:
      return state.filter(item => item.type !== action.payload);
    case ConsultationActionTypes.REMOVE_CONSULTATIONV2:
      return [];
    default:
      return state;
  }
};

export default consultationReducer;
