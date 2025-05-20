import { handleHeightWeightQuestion } from './handleHeightWeightQuestion';
import { handleMedicationHistory } from './handleMedicationHistory';
import {
  firstScreenerCode,
  handlePatientDiagnosis,
  secondScreenerCode,
} from './handlePatientDiagnosis';
import { Patient, QuestionnaireResponse, Response } from './types';

export const processWeightLossQuestionnaire = async (
  questionnaire: QuestionnaireResponse,
  patient: Patient
) => {
  const responses = (questionnaire?.response as Response).items;

  await Promise.all([
    //handle height weight
    handleHeightWeightQuestion(responses, 'WEIGHT_L_Q1', patient.id),
    //handle diagnosis #1
    handlePatientDiagnosis(
      responses,
      'WEIGHT_L_Q6',
      patient.id,
      firstScreenerCode
    ),
    //handle diagnoses #2
    handlePatientDiagnosis(
      responses,
      'WEIGHT_L_Q7',
      patient.id,
      secondScreenerCode
    ),

    //handle medication history
    handleMedicationHistory(responses, patient.id, {
      allergyQuestion: 'WEIGHT_L_Q10',
      specificMedicationQuestion: 'WEIGHT_L_Q11',
    }),
  ]);
};
