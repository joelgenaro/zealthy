import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { VisitQuestionnaireType } from '@/context/AppContext/reducers/types/visit';
import { envMapping } from '@/questionnaires';
import { QuestionnaireName } from '@/types/questionnaire';

const mentalHealthQuestionnaires = [
  QuestionnaireName.PHQ_9_followup,
  QuestionnaireName.GAD_7,
  QuestionnaireName.MENTAL_HEALTH_FOLLOWUP_RESULTS,
];

export const mapMentalHealthFollowupToQuestionnaires = () =>
  mentalHealthQuestionnaires.map(
    questionnaireName =>
      ({
        name: questionnaireName,
        care: SpecificCareOption.ANXIETY_OR_DEPRESSION.toLowerCase(),
        entry: envMapping[questionnaireName]?.entry,
      } as VisitQuestionnaireType)
  );
