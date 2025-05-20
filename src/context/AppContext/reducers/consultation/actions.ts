import { Dispatch } from 'react';
import {
  ConsultationActions,
  ConsultationActionTypes,
  ConsultationState,
  ConsultationType,
} from '../types/consultation';

export const getConsultationActions = (
  dispatch: Dispatch<ConsultationActions>
) => ({
  addConsultation: (payload: ConsultationState) =>
    dispatch({
      type: ConsultationActionTypes.ADD_CONSULTATION,
      payload,
    }),
  removeConsultation: (payload: ConsultationType) =>
    dispatch({
      type: ConsultationActionTypes.REMOVE_CONSULTATION,
      payload,
    }),
  removeConsultationV2: () =>
    dispatch({
      type: ConsultationActionTypes.REMOVE_CONSULTATIONV2,
    }),
  resetConsultation: () =>
    dispatch({ type: ConsultationActionTypes.CLEAR_CONSULTATION }),
});
