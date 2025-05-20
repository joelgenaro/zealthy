import { Dispatch } from 'react';
import {
  AppointmentActions,
  AppointmentActionTypes,
  AppointmentState,
  AppointmentUpdateType,
} from '../types/appointment';

export const getAppointmentActions = (
  dispatch: Dispatch<AppointmentActions>
) => ({
  addAppointment: (payload: AppointmentState) =>
    dispatch({
      type: AppointmentActionTypes.CREATE,
      payload,
    }),
  updateAppointment: (payload: AppointmentUpdateType) =>
    dispatch({
      type: AppointmentActionTypes.UPDATE,
      payload,
    }),
  removeAppointment: (payload: AppointmentState['appointment_type']) =>
    dispatch({
      type: AppointmentActionTypes.REMOVE,
      payload,
    }),
  resetAppointment: () =>
    dispatch({ type: AppointmentActionTypes.CLEAR_APPOINTMENTS }),
});
