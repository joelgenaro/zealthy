import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';

const specificCareToQuestionnaireMapping = {
  [SpecificCareOption.ANXIETY_OR_DEPRESSION]: '/',
  [SpecificCareOption.BIRTH_CONTROL]: '/birth-control',
  [SpecificCareOption.ERECTILE_DYSFUNCTION]: '/ed',
  [SpecificCareOption.HAIR_LOSS]: 'hair-loss',
  [SpecificCareOption.WEIGHT_LOSS]: '/weight-loss',
  [SpecificCareOption.WEIGHT_LOSS_AD]: '/weight-loss-ad',
  [SpecificCareOption.DEFAULT]: '/',
  [SpecificCareOption.OTHER]: '/',
  [SpecificCareOption.PRIMARY_CARE]: '/',
  [SpecificCareOption.VIRTUAL_URGENT_CARE]: '/',
  [SpecificCareOption.ACNE]: '/',
  [SpecificCareOption.ANTI_AGING]: '/',
  [SpecificCareOption.MELASMA]: '/',
  [SpecificCareOption.ROSACEA]: '/',
  [SpecificCareOption.SKINCARE]: '/',
  [SpecificCareOption.ASYNC_MENTAL_HEALTH]: '/amh',
  [SpecificCareOption.WEIGHT_LOSS_ACCESS]: '/',
  [SpecificCareOption.WEIGHT_LOSS_ACCESS_V2]: '/',
  [SpecificCareOption.ENCLOMIPHENE]: '/enclomiphene',
  [SpecificCareOption.PRE_WORKOUT]: '/pre-workout',
  [SpecificCareOption.FEMALE_HAIR_LOSS]: '/hair-loss-f',
  [SpecificCareOption.PREP]: '/prep',
  [SpecificCareOption.SLEEP]: '/sleep',
  [SpecificCareOption.SEX_PLUS_HAIR]: '/ed-hl',
  [SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT]: '/weight-loss-free-sync-visit',
  [SpecificCareOption.MENOPAUSE]: '/menopause',
};

export const mapSpecificCareToPath = (care: SpecificCareOption) =>
  specificCareToQuestionnaireMapping[care];
