import { handleHeightWeightQuestion } from './handleHeightWeightQuestion';

import { Patient, QuestionnaireResponse, Response } from './types';

export const processWeightLossV2Questionnaire = async (
  questionnaire: QuestionnaireResponse,
  patient: Patient
) => {
  console.log('Processing Weight Loss V2 Questionnaire');

  const responses = (questionnaire?.response as Response).items;

  await Promise.all([
    //handle height weight
    handleHeightWeightQuestion(responses, 'WEIGHT_L_Q1', patient.id),
  ]);
};
