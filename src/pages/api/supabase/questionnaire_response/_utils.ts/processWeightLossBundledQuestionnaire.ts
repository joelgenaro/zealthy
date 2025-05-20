import { handleHeightWeightQuestion } from './handleHeightWeightQuestion';
import {
  firstScreenerCode,
  handlePatientDiagnosis,
} from './handlePatientDiagnosis';
import { Patient, QuestionnaireResponse, Response } from './types';

export const processWeightLossBundledQuestionnaire = async (
  questionnaire: QuestionnaireResponse,
  patient: Patient
) => {
  console.log({
    level: 'info',
    message: 'Processing Weight Loss Bundled Questionnaire',
  });

  const responses = (questionnaire?.response as Response).items;

  await Promise.all([
    //handle height weight
    handleHeightWeightQuestion(responses, 'WEIGHT_L_Q1', patient.id),
    //handle diagnosis #1
    handlePatientDiagnosis(
      responses,
      'WEIGHT_L_Q3',
      patient.id,
      firstScreenerCode
    ),
  ]);
};
