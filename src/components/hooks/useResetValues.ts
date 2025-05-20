import { useCallback } from 'react';
import { useAnswerActions } from './useAnswer';
import { useAppointmentActions } from './useAppointment';
import { useCoachingActions } from './useCoaching';
import { useConsultationActions } from './useConsultation';

export const useResetValues = () => {
  const { clearAnswers } = useAnswerActions();
  const { resetAppointment } = useAppointmentActions();
  const { resetCoaching } = useCoachingActions();
  const { resetConsultation } = useConsultationActions();

  return useCallback(() => {
    return [
      clearAnswers,
      resetCoaching,
      resetConsultation,
      resetAppointment,
    ].reduce((acc, callback) => {
      callback();
      return acc;
    }, undefined);
  }, [clearAnswers, resetCoaching, resetConsultation, resetAppointment]);
};
