import { handleMedicationHistory } from './handleMedicationHistory';
import { QuestionnaireResponse, Patient, Response } from './types';

export const processWeightLossPostQuestionnaire = async (
  questionnaire: QuestionnaireResponse,
  patient: Patient
) => {
  const responses = (questionnaire?.response as Response)?.items;

  await Promise.all([
    handleMedicationHistory(responses, patient.id, {
      supplementQuestion: 'WEIGHT_L_POST_Q5',
    }),
  ]);

  return;
};
