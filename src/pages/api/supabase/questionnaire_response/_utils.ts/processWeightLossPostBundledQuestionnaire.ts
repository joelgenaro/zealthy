import { handleMedicationHistory } from './handleMedicationHistory';
import {
  handlePatientDiagnosis,
  secondScreenerCode,
} from './handlePatientDiagnosis';
import { Patient, QuestionnaireResponse, Response } from './types';

export const processWeightLossPostBundledQuestionnaire = async (
  questionnaire: QuestionnaireResponse,
  patient: Patient
) => {
  console.log('Processing Weight Loss Post Bundled Questionnaire');

  const responses = (questionnaire?.response as Response)?.items;

  await Promise.all([
    handlePatientDiagnosis(
      responses,
      'WEIGHT_L_POST_Q4',
      patient.id,
      secondScreenerCode
    ),

    handleMedicationHistory(responses, patient.id, {
      supplementQuestion: 'WEIGHT_L_POST_Q6',
      allergyQuestion: 'WEIGHT_L_POST_Q8',
      medicalConditionQuestion: 'WEIGHT_L_POST_Q14',
    }),
  ]);
};
