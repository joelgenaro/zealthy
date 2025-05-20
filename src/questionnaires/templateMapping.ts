import AsyncMentalHealthCurrentMedsTemplate from '@/questionnaires/templates/async-mental-health-current-meds.json';
import AsyncMentalHealthPreviousMedsTemplate from '@/questionnaires/templates/async-mental-health-previous-meds.json';
import WeightLossDiagnosis from '@/questionnaires/templates/weight-loss-diagnosis.json';
import WeightLossMedications from '@/questionnaires/templates/weight-loss-medications.json';
import WeightLossGLP1Medications from '@/questionnaires/templates/weight-loss-glp1-medications.json';
import PreWorkoutPreviousMedsTemplate from '@/questionnaires/templates/pre-workout-previous-meds.json';
import { Questionnaire } from '@/types/questionnaire';

export const templateMap: { [key: string]: Questionnaire } = {
  'async-mental-health-current-meds':
    AsyncMentalHealthCurrentMedsTemplate as unknown as Questionnaire,
  'async-mental-health-previous-meds':
    AsyncMentalHealthPreviousMedsTemplate as unknown as Questionnaire,
  'weight-loss-diagnosis': WeightLossDiagnosis as unknown as Questionnaire,
  'weight-loss-medications': WeightLossMedications as unknown as Questionnaire,
  'weight-loss-glp1-medications':
    WeightLossGLP1Medications as unknown as Questionnaire,
  'pre-workout-previous-meds':
    PreWorkoutPreviousMedsTemplate as unknown as Questionnaire,
};
