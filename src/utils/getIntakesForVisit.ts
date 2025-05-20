import {
  intakeQuestionnaires,
  meetsConditions,
} from '@/constants/intake-questionnaires';
import { CareSelectionMapping } from '@/types/careSelection';
import { CoachingState } from '@/context/AppContext/reducers/types/coaching';
import { QuestionnaireName } from '@/types/questionnaire';
import { envMapping } from '@/questionnaires';

export type IntakeType = {
  name: QuestionnaireName;
  entry: string | null;
  care?: string;
};

export function getIntakesForVisit(
  careSelections: CareSelectionMapping[],
  hasInsurance: boolean,
  birthDate: string | null,
  gender: string | null,
  coaching: CoachingState[]
): IntakeType[] {
  return intakeQuestionnaires
    .filter(q =>
      meetsConditions(
        q.conditionals,
        careSelections,
        hasInsurance,
        birthDate,
        gender,
        coaching
      )
    )
    .map(({ questionnaire }) => ({
      name: questionnaire,
      entry: envMapping[questionnaire]!.entry,
      care: envMapping[questionnaire]!.care,
    }));
}
