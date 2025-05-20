import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { VisitQuestionnaireType } from '@/context/AppContext/reducers/types/visit';
import { envMapping } from '@/questionnaires';
import { QuestionnaireName } from '@/types/questionnaire';

const careToQuestionnaireMapping: {
  [key: string]: QuestionnaireName[];
} = {
  Meds: [QuestionnaireName.NON_GLP1_MEDS],
  Request: [QuestionnaireName.NON_GLP1_MEDS_REQUEST],
};

export const mapNonGlp1MedsToQuestionnaires = (care: string) => {
  const questionnaires = careToQuestionnaireMapping[care].filter(Boolean);
  return questionnaires.map(
    questionnaireName =>
      ({
        name: questionnaireName,
        care: SpecificCareOption.WEIGHT_LOSS.toLowerCase(),
        entry: envMapping[questionnaireName]?.entry,
      } as VisitQuestionnaireType)
  );
};
