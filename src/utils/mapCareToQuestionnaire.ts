import { VisitQuestionnaireType } from "@/context/AppContext/reducers/types/visit";
import { envMapping } from "@/questionnaires";
import { QuestionnaireName } from "@/types/questionnaire";
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';

const careToQuestionnaireMapping: {
  [key: string]: QuestionnaireName[];
} = {
  "Erectile dysfunction": [
    QuestionnaireName.ERECTILE_DYSFUNCTION,
    QuestionnaireName.VOUCHED_VERIFICATION,
  ],
  "Birth control": [
    QuestionnaireName.BIRTH_CONTROL,
    QuestionnaireName.VOUCHED_VERIFICATION,
  ],
  "Weight loss": [
    QuestionnaireName.WEIGHT_LOSS_V2,
  ],
  "Weight loss bundled": [QuestionnaireName.WEIGHT_LOSS_BUNDLED],
  "Hair loss": [
    QuestionnaireName.HAIR_LOSS,
    QuestionnaireName.DELIVERY_ADDRESS,
    QuestionnaireName.PHOTO_IDENTIFICATION,
  ],
  "Anxiety or depression": [
    QuestionnaireName.PHQ_9,
    QuestionnaireName.GAD_7,
    QuestionnaireName.MENTAL_HEALTH_TREATMENT,
    QuestionnaireName.MENTAL_HEALTH_PROVIDER_SCHEDULE,
  ],
  "Mental health": [
    QuestionnaireName.ASYNC_MENTAL_HEALTH_INTRO,
    QuestionnaireName.PHQ_9,
    QuestionnaireName.GAD_7,
    QuestionnaireName.ASYNC_MENTAL_HEALTH_RESULTS,
    QuestionnaireName.ASYNC_MENTAL_HEALTH_MED_QUESTIONS,
    QuestionnaireName.VOUCHED_VERIFICATION,
  ],
  "Skincare": [],
  "Primary care": [QuestionnaireName.PRIMARY_CARE],
  "Cold or flu-like symptoms": [QuestionnaireName.PRIMARY_CARE],
  "I’m not sure": [QuestionnaireName.PRIMARY_CARE],
  Other: [QuestionnaireName.PRIMARY_CARE],

  "Acne": [QuestionnaireName.ACNE_TREATMENT],
  "Fine Lines & Wrinkles": [QuestionnaireName.ANTI_AGING_TREATMENT],
  "Hyperpigmentation Dark Spots": [QuestionnaireName.MELASMA_TREATMENT],
  "Rosacea": [QuestionnaireName.ROSACEA_TREATMENT],
  "Weight Loss Refill": [QuestionnaireName.WEIGHT_LOSS_REFILL],
  "Weight Loss Refill Additional": [QuestionnaireName.WEIGHT_LOSS_REFILL_ADDITIONAL],
  "Weight Loss Bundle Refill": [QuestionnaireName.WEIGHT_LOSS_BUNDLE_REFILL],
  "Weight Loss Compound Refill": [
    QuestionnaireName.WEIGHT_LOSS_COMPOUND_REFILL,
  ],
  "Weight Loss Compound Quarterly Refill": [
    QuestionnaireName.WEIGHT_LOSS_COMPOUND_QUARTERLY_REFILL,
  ],
  "Weight Loss Access Portal": [QuestionnaireName.WEIGHT_LOSS_ACCESS_PORTAL],
  "Weight Loss Checkin": [QuestionnaireName.WEIGHT_LOSS_QUARTERLY_CHECKIN],
  "Weight Loss Bundle Reorder": [QuestionnaireName.WEIGHT_LOSS_BUNDLE_REORDER],
  "Weight Loss Compound Refill Recurring": [
    QuestionnaireName.WEIGHT_LOSS_COMPOUND_REFILL_RECURRING,
  ],
  "Weight Loss Compound Refill Recurring Additional": [
    QuestionnaireName.WEIGHT_LOSS_COMPOUND_REFILL_RECURRING_ADDITIONAL,
  ],
  Enclomiphene: [
    QuestionnaireName.ENCLOMIPHENE,
    QuestionnaireName.VOUCHED_VERIFICATION,
  ],
  "Preworkout": [
    QuestionnaireName.PRE_WORKOUT,
  ],
  "Sex + Hair": [
    QuestionnaireName.SEX_PLUS_HAIR,
    QuestionnaireName.VOUCHED_VERIFICATION
  ],
  "Hair Loss": [
    QuestionnaireName.FEMALE_HAIR_LOSS,
  ],
  "ED hardies": [
    QuestionnaireName.ED_HARDIES,
    QuestionnaireName.VOUCHED_VERIFICATION,
  ],
  "Weight loss V2": [
    QuestionnaireName.WEIGHT_LOSS_V2,
  ],
  "Weight loss Spanish": [
    QuestionnaireName.WEIGHT_LOSS_SPANISH,
  ],
  "Additional PA": [
    QuestionnaireName.ADDITIONAL_PA
  ],
  "Weight Loss Flexible": [QuestionnaireName.WEIGHT_LOSS_4758],
  "Weight Loss Flexible Semaglutide": [QuestionnaireName.WEIGHT_LOSS_BUNDLED_4758],
  "Mental Health Refill Request": [QuestionnaireName.MENTAL_HEALTH_REFILL_REQUEST],
  "Prep": [
    QuestionnaireName.PREP,
    QuestionnaireName.VOUCHED_VERIFICATION
  ],
  "Weight Loss Continue": [QuestionnaireName.WEIGHT_LOSS_CONTINUE],
  "Sleep": [QuestionnaireName.SLEEP, QuestionnaireName.VOUCHED_VERIFICATION],
  "Weight Loss Free Consult": [QuestionnaireName.WEIGHT_LOSS_FREE_CONSULT],
  "Menopause": [QuestionnaireName.MENOPAUSE, QuestionnaireName.VOUCHED_VERIFICATION],
  "Preworkout Prescription Renewal": [QuestionnaireName.PRE_WORKOUT_PRESCRIPTION_RENEWAL],
  "Insomnia Prescription Renewal": [QuestionnaireName.SLEEP_PRESCRIPTION_RENEWAL],
  "EDHL Prescription Renewal": [QuestionnaireName.SEX_PLUS_HAIR_PRESCRIPTION_RENEWAL],
  'Enclomiphene Prescription Renewal': [QuestionnaireName.ENCLOMIPHENE_PRESCRIPTION_RENEWAL],
  "Menopause Refill": [QuestionnaireName.MENOPAUSE_REFILL],
  'Birth Control Prescription Renewal': [QuestionnaireName.BIRTH_CONTROL_PRESCRIPTION_RENEWAL],
  'Male Hair Loss Prescription Renewal': [QuestionnaireName.HAIR_LOSS_MALE_PRESCRIPTION_RENEWAL],
  'Female Hair Loss Prescription Renewal': [QuestionnaireName.HAIR_LOSS_FEMALE_PRESCRIPTION_RENEWAL],
  'ED Prescription Renewal': [QuestionnaireName.ERECTILE_DYSFUNCTION_PRESCRIPTION_RENEWAL]
};

export const mapCareToQuestionnaires = (cares: string[]) =>
  cares
    .map((care) => {
      const questionnaires = careToQuestionnaireMapping[care].filter(Boolean);
      return questionnaires.map(
        (name) =>
          ({
            name,
            care: care.toLowerCase(),
            entry: envMapping[name]?.entry,
            intro: !!envMapping[name]?.intro,
          } as VisitQuestionnaireType)
      );
    })
    .flat();

// Reverse map: Questionnaire to Care
const questionnaireToCareMapping: { [key in QuestionnaireName]?: string } = {};

// Generate the reverse mapping
Object.entries(careToQuestionnaireMapping).forEach(([care, questionnaires]) => {
  questionnaires.forEach((questionnaire) => {
    if (!questionnaireToCareMapping[questionnaire]) {
      questionnaireToCareMapping[questionnaire] = care; // Assign care directly
    }
  });
});

questionnaireToCareMapping[QuestionnaireName.WEIGHT_LOSS_POST_V2] = "Weight loss";
questionnaireToCareMapping[QuestionnaireName.WEIGHT_LOSS_TREATMENT] = "Weight loss";
questionnaireToCareMapping[QuestionnaireName.WEIGHT_LOSS_PAY] = "Weight loss";
questionnaireToCareMapping[QuestionnaireName.WEIGHT_LOSS_BUNDLED_TREATMENT] = "Weight loss bundled";

// Function to get a single care type from a questionnaire name
export const mapQuestionnaireToCare = (questionnaire: QuestionnaireName): SpecificCareOption => {
  return (questionnaireToCareMapping[questionnaire] as SpecificCareOption) ?? SpecificCareOption.DEFAULT;
};
