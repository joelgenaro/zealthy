import { handleMedicationHistory } from './handleMedicationHistory';
import {
  firstScreenerCode,
  handlePatientDiagnosis,
  secondScreenerCode,
} from './handlePatientDiagnosis';
import { QuestionnaireResponse, Patient, Response } from './types';

export const processWeightLossPostV2Questionnaire = async (
  questionnaire: QuestionnaireResponse,
  patient: Patient
) => {
  const responses = (questionnaire?.response as Response)?.items;

  await Promise.all([
    handlePatientDiagnosis(
      responses,
      'WEIGHT_L_POST_Q4',
      patient.id,
      firstScreenerCode
    ),

    handlePatientDiagnosis(
      responses,
      'WEIGHT_L_POST_Q5',
      patient.id,
      secondScreenerCode
    ),

    handleMedicationHistory(responses, patient.id, {
      allergyQuestion: 'WEIGHT_L_POST_Q9',
      medicalConditionQuestion: 'WEIGHT_L_POST_Q15',
      supplementQuestion: 'WEIGHT_L_POST_Q7',
    }),
  ]);

  return;
};
