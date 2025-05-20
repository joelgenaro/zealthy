import { intakeQuestionnaires } from '@/constants/intake-questionnaires-v2';
import { envMapping } from '@/questionnaires';
import { QuestionnaireName } from '@/types/questionnaire';
import jsonLogic from 'json-logic-js';

export type IntakeType = {
  name: QuestionnaireName;
  entry: string | null;
  care?: string;
  intro: boolean;
  questions?: any;
};

const getIntakesForVisit = (data: unknown): IntakeType[] =>
  intakeQuestionnaires
    .filter(questionnaire => jsonLogic.apply(questionnaire.conditions, data))
    .map(({ questionnaire }) => ({
      name: questionnaire,
      entry: envMapping[questionnaire]!.entry,
      care: envMapping[questionnaire]!.care,
      intro: !!envMapping[questionnaire]!.intro,
      questions: envMapping[questionnaire]!.questions,
    }));

export default getIntakesForVisit;
