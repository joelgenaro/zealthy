import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { VisitQuestionnaireType } from '@/context/AppContext/reducers/types/visit';
import { envMapping } from '@/questionnaires';
import { QuestionnaireName } from '@/types/questionnaire';

const mentalHealthQuestionnaires = [
  QuestionnaireName.PHQ_9_checkin,
  QuestionnaireName.GAD_7,
  QuestionnaireName.MENTAL_HEALTH_TREATMENT,
  QuestionnaireName.ASYNC_MENTAL_HEALTH_RESULTS,
];

export const mapMentalHealthCheckInToQuestionnaires = () =>
  mentalHealthQuestionnaires.map(
    questionnaireName =>
      ({
        name: questionnaireName,
        care: SpecificCareOption.ANXIETY_OR_DEPRESSION.toLowerCase(),
        entry: envMapping[questionnaireName]?.entry,
      } as VisitQuestionnaireType)
  );
