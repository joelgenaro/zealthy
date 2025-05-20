import {
  AppointmentActions,
  AppointmentActionTypes,
  AppointmentState,
} from '../types/appointment';
import { IAppState } from '../types/appState';
import { CommonActionTypes } from '../types/common';

export const appointmentInitialState: AppointmentState[] = [];

const appointmentReducer = (
  state: AppointmentState[],
  action: AppointmentActions
): AppointmentState[] => {
  switch (action.type) {
    case CommonActionTypes.INIT:
      return [...(action.payload as IAppState).appointment];
    case CommonActionTypes.RESET:
      return [];
    case AppointmentActionTypes.CLEAR_APPOINTMENTS:
      return [];
    case AppointmentActionTypes.CREATE:
      return state
        .filter(a => a.appointment_type !== action.payload.appointment_type)
        .concat(action.payload);
    case AppointmentActionTypes.REMOVE:
      return state.filter(a => a.appointment_type !== action.payload);
    case AppointmentActionTypes.UPDATE:
      return state.map(a => {
        if (a.appointment_type === action.payload.appointment_type) {
          return {
            ...a,
            ...action.payload,
          };
        } else {
          return a;
        }
      });
    default:
      return state;
  }
};

export default appointmentReducer;
