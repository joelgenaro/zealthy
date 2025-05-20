import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { VisitQuestionnaireType } from '@/context/AppContext/reducers/types/visit';
import { envMapping } from '@/questionnaires';
import { QuestionnaireName } from '@/types/questionnaire';

const specificCareToQuestionnaireMapping = {
  [SpecificCareOption.ANXIETY_OR_DEPRESSION]: [] as QuestionnaireName[],
  [SpecificCareOption.ASYNC_MENTAL_HEALTH]: [] as QuestionnaireName[],
  [SpecificCareOption.BIRTH_CONTROL]: [] as QuestionnaireName[],
  [SpecificCareOption.ERECTILE_DYSFUNCTION]: [] as QuestionnaireName[],
  [SpecificCareOption.HAIR_LOSS]: [] as QuestionnaireName[],
  [SpecificCareOption.WEIGHT_LOSS]: [] as QuestionnaireName[],
  [SpecificCareOption.WEIGHT_LOSS_AD]: [] as QuestionnaireName[],
  [SpecificCareOption.PRIMARY_CARE]: [] as QuestionnaireName[],
  [SpecificCareOption.VIRTUAL_URGENT_CARE]: [] as QuestionnaireName[],
  [SpecificCareOption.ACNE]: [QuestionnaireName.ACNE_TREATMENT],
  [SpecificCareOption.ANTI_AGING]: [QuestionnaireName.ANTI_AGING_TREATMENT],
  [SpecificCareOption.MELASMA]: [QuestionnaireName.MELASMA_TREATMENT],
  [SpecificCareOption.ROSACEA]: [QuestionnaireName.ROSACEA_TREATMENT],
  [SpecificCareOption.SKINCARE]: [] as QuestionnaireName[],
  [SpecificCareOption.DEFAULT]: [] as QuestionnaireName[],
  [SpecificCareOption.OTHER]: [] as QuestionnaireName[],
  [SpecificCareOption.WEIGHT_LOSS_ACCESS]: [] as QuestionnaireName[],
  [SpecificCareOption.WEIGHT_LOSS_ACCESS_V2]: [] as QuestionnaireName[],
  [SpecificCareOption.ENCLOMIPHENE]: [] as QuestionnaireName[],
  [SpecificCareOption.PRE_WORKOUT]: [] as QuestionnaireName[],
  [SpecificCareOption.FEMALE_HAIR_LOSS]: [] as QuestionnaireName[],
  [SpecificCareOption.PREP]: [] as QuestionnaireName[],
  [SpecificCareOption.SLEEP]: [] as QuestionnaireName[],
  [SpecificCareOption.SEX_PLUS_HAIR]: [] as QuestionnaireName[],
  [SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT]: [] as QuestionnaireName[],
  [SpecificCareOption.MENOPAUSE]: [] as QuestionnaireName[],
};

export const toVisitQuestionnaire = (questionnaireName: QuestionnaireName) =>
  ({
    name: questionnaireName,
    entry: envMapping[questionnaireName]?.entry,
  } as VisitQuestionnaireType);

export const mapSpecificCareToQuestionnaires = (care: SpecificCareOption) =>
  specificCareToQuestionnaireMapping[care].map(toVisitQuestionnaire);
