import { QuestionnaireName } from '@/types/questionnaire';
import { RulesLogic } from 'json-logic-js';
import {
  acneCareSelected,
  alwaysExceptSkincare,
  alwaysExceptWeightLoss,
  antiAgingCareSelected,
  asyncMentalHealthCareSelected,
  birthControlCareSelected,
  edCareSelected,
  edHLCareSelected,
  enclomipheneSelected,
  femaleHairLossCareSelected,
  hairLossCareSelected,
  hasINInsurance,
  hasNotVerifiedIdentity,
  isVariant5484VariationOne,
  isVariant5484VariationTwo,
  isWeightLossPostV1,
  melasmaCareSelected,
  mentalHealthCareSelected,
  mentalHealthCoachPlanNotSelected,
  mentalHealthCoachPlanSelected,
  oralSemaglutideBundled,
  preWorkoutSelected,
  providerScheduledAppointmentIsConfirmed,
  providerScheduledAppointmentIsNotConfirmed,
  providerWalkedInAppointmentIsConfirmed,
  providerWalkedInAppointmentIsNotConfirmed,
  psychiatryCoachPlanSelected,
  regionIsFlorida,
  rosaceaCareSelected,
  semaglutideAndTirzepatideBundled,
  skinCareSelected,
  visitIsSync,
  weightLossCareSelected,
  isVariation8205VariationFour,
  menopauseCareSelected,
} from './rules/post-checkout-intake';

type PostCheckoutIntake = {
  questionnaire: QuestionnaireName;
  conditions: RulesLogic<{}>;
};

export const intakeQuestionnaires: PostCheckoutIntake[] = [
  {
    questionnaire: QuestionnaireName.UNABLE_CONFIRM_SCHEDULED_APPOINTMENT,
    conditions: {
      and: [
        { ...visitIsSync },
        { ...providerScheduledAppointmentIsNotConfirmed },
      ],
    },
  },
  {
    questionnaire: QuestionnaireName.UNABLE_CONFIRM_WALKEDIN_APPOINTMENT,
    conditions: {
      and: [
        { ...visitIsSync },
        { ...providerWalkedInAppointmentIsNotConfirmed },
      ],
    },
  },
  {
    questionnaire: QuestionnaireName.CHECKOUT_SUCCESS,
    conditions: {
      and: [
        { '!': { ...providerWalkedInAppointmentIsNotConfirmed } },
        { '!': { ...providerScheduledAppointmentIsNotConfirmed } },
        { '!': { ...weightLossCareSelected } },
        { '!': { ...birthControlCareSelected } },
        { '!': { ...edCareSelected } },
        { '!': { ...edHLCareSelected } },
        { '!': { ...menopauseCareSelected } },
        { '!': { ...hairLossCareSelected } },
        { '!': { ...asyncMentalHealthCareSelected } },
        { '!': { ...femaleHairLossCareSelected } },
        { '!': { ...skinCareSelected } },
      ],
    },
  },
  {
    questionnaire: QuestionnaireName.ACNE_INTRO,
    conditions: acneCareSelected,
  },
  {
    questionnaire: QuestionnaireName.ANTI_AGING_INTRO,
    conditions: antiAgingCareSelected,
  },
  {
    questionnaire: QuestionnaireName.MELASMA_INTRO,
    conditions: melasmaCareSelected,
  },
  {
    questionnaire: QuestionnaireName.ROSACEA_INTRO,
    conditions: rosaceaCareSelected,
  },
  {
    questionnaire: QuestionnaireName.SKINCARE_CHECKOUT_SUCCESS,
    conditions: skinCareSelected,
  },
  {
    questionnaire: QuestionnaireName.INSTANT_LIVE_VISIT_START,
    conditions: {
      and: [{ ...visitIsSync }, { ...providerWalkedInAppointmentIsConfirmed }],
    },
  },
  {
    questionnaire: QuestionnaireName.IDENTITY_VERIFICATION,
    conditions: {
      and: [
        { ...providerWalkedInAppointmentIsConfirmed },
        { ...hasNotVerifiedIdentity },
      ],
    },
  },
  {
    questionnaire: QuestionnaireName.PROVIDER_VISIT_CONFIRMATION,
    conditions: {
      and: [{ ...visitIsSync }, { ...providerScheduledAppointmentIsConfirmed }],
    },
  },
  {
    questionnaire: QuestionnaireName.PSYCHIATRY_POST_CHECKOUT_INTO,
    conditions: psychiatryCoachPlanSelected,
  },

  {
    questionnaire: QuestionnaireName.ASYNC_MEDICAL_HISTORY,
    conditions: {
      and: [
        { '!': hasINInsurance },
        { '!': { ...birthControlCareSelected } },
        { '!': { ...edCareSelected } },
        { '!': { ...edHLCareSelected } },
        { '!': { ...menopauseCareSelected } },
        { '!': { ...hairLossCareSelected } },
        { '!': { ...asyncMentalHealthCareSelected } },
        { '!': { ...enclomipheneSelected } },
        { '!': { ...preWorkoutSelected } },
        { '!': { ...femaleHairLossCareSelected } },
        alwaysExceptSkincare,
        alwaysExceptWeightLoss,
      ],
    },
  },

  {
    questionnaire: QuestionnaireName.MEDICAL_HISTORY,
    conditions: {
      and: [hasINInsurance, alwaysExceptWeightLoss],
    },
  },
  {
    questionnaire: QuestionnaireName.DELIVERY_ADDRESS,
    conditions: {
      and: [
        alwaysExceptWeightLoss,
        { '!': { ...birthControlCareSelected } },
        { '!': { ...edCareSelected } },
        { '!': { ...edHLCareSelected } },
        { '!': { ...menopauseCareSelected } },
        { '!': { ...hairLossCareSelected } },
        { '!': { ...asyncMentalHealthCareSelected } },
        { '!': { ...skinCareSelected } },
        { '!': { ...enclomipheneSelected } },
        { '!': { ...preWorkoutSelected } },
        { '!': { ...femaleHairLossCareSelected } },
      ],
    },
  },
  {
    questionnaire: QuestionnaireName.VOUCHED_VERIFICATION,
    conditions: skinCareSelected,
  },
  {
    questionnaire: QuestionnaireName.SKIN_TYPE,
    conditions: skinCareSelected,
  },
  {
    questionnaire: QuestionnaireName.PHARMACY_PREFERENCE,
    conditions: {
      and: [
        alwaysExceptWeightLoss,
        { '!': { ...birthControlCareSelected } },
        { '!': { ...edCareSelected } },
        { '!': { ...edHLCareSelected } },
        { '!': { ...menopauseCareSelected } },
        { '!': { ...hairLossCareSelected } },
        { '!': { ...asyncMentalHealthCareSelected } },
        { '!': { ...skinCareSelected } },
        { '!': { ...enclomipheneSelected } },
        { '!': { ...preWorkoutSelected } },
        { '!': { ...femaleHairLossCareSelected } },
      ],
    },
  },
  {
    questionnaire: QuestionnaireName.HEIGHT_WEIGHT,
    conditions: {
      and: [hasINInsurance, alwaysExceptWeightLoss],
    },
  },
  {
    questionnaire: QuestionnaireName.PHQ_9,
    conditions: {
      and: [
        hasINInsurance,
        { '!': { ...mentalHealthCareSelected } },
        { '!': { ...weightLossCareSelected } },
      ],
    },
  },
  {
    questionnaire: QuestionnaireName.GAD_7,
    conditions: {
      and: [
        hasINInsurance,
        { '!': { ...mentalHealthCareSelected } },
        { '!': { ...weightLossCareSelected } },
      ],
    },
  },

  {
    questionnaire: QuestionnaireName.DRUGS_ALCOHOL_TOBACCO,
    conditions: hasINInsurance,
  },
  {
    questionnaire: QuestionnaireName.MENTAL_HEALTH_SCHEDULE_COACH,
    conditions: mentalHealthCoachPlanSelected,
  },
  {
    questionnaire: QuestionnaireName.ACNE_TREATMENT,
    conditions: acneCareSelected,
  },
  {
    questionnaire: QuestionnaireName.ANTI_AGING_TREATMENT,
    conditions: antiAgingCareSelected,
  },
  {
    questionnaire: QuestionnaireName.MELASMA_TREATMENT,
    conditions: melasmaCareSelected,
  },
  {
    questionnaire: QuestionnaireName.ROSACEA_TREATMENT,
    conditions: rosaceaCareSelected,
  },
  {
    questionnaire: QuestionnaireName.HAIR_LOSS_POST,
    conditions: hairLossCareSelected,
  },
  {
    questionnaire: QuestionnaireName.ASYNC_WHAT_HAPPENS_NEXT,
    conditions: {
      and: [
        { '!': { ...visitIsSync } },
        { '!': { ...birthControlCareSelected } },
        { '!': { ...edCareSelected } },
        { '!': { ...edHLCareSelected } },
        { '!': { ...menopauseCareSelected } },
        { '!': { ...hairLossCareSelected } },
        { '!': { ...asyncMentalHealthCareSelected } },
        { '!': { ...acneCareSelected } },
        { '!': { ...antiAgingCareSelected } },
        { '!': { ...rosaceaCareSelected } },
        { '!': { ...melasmaCareSelected } },
        { '!': { ...skinCareSelected } },
        { '!': { ...preWorkoutSelected } },
        { '!': { ...femaleHairLossCareSelected } },
        { '!': { ...enclomipheneSelected } },
        { ...alwaysExceptWeightLoss },
      ],
    },
  },

  {
    questionnaire: QuestionnaireName.VOUCHED_VERIFICATION,
    conditions: preWorkoutSelected,
  },
  {
    questionnaire: QuestionnaireName.ASYNC_WHAT_HAPPENS_NEXT_V2,
    conditions: {
      or: [
        birthControlCareSelected,
        edCareSelected,
        edHLCareSelected,
        menopauseCareSelected,
        hairLossCareSelected,
        enclomipheneSelected,
        preWorkoutSelected,
        femaleHairLossCareSelected,
      ],
    },
  },
  {
    questionnaire: QuestionnaireName.SKINCARE_WHAT_NEXT,
    conditions: skinCareSelected,
  },

  {
    questionnaire: QuestionnaireName.BIPOLAR_AND_MANIA,
    conditions: asyncMentalHealthCareSelected,
  },

  {
    questionnaire: QuestionnaireName.ASYNC_MENTAL_HEALTH_POST,
    conditions: asyncMentalHealthCareSelected,
  },

  {
    questionnaire: QuestionnaireName.MENTAL_HEALTH_ADD_SCHEDULE_COACH,
    conditions: {
      and: [
        {
          or: [
            { ...mentalHealthCareSelected },
            { ...asyncMentalHealthCareSelected },
          ],
        },
        { ...mentalHealthCoachPlanNotSelected },
      ],
    },
  },
  {
    questionnaire: QuestionnaireName.THANK_YOU,
    conditions: visitIsSync,
  },
  {
    questionnaire: QuestionnaireName.INSTANT_LIVE_VISIT_END,
    conditions: {
      and: [{ ...visitIsSync }, { ...providerWalkedInAppointmentIsConfirmed }],
    },
  },
  {
    questionnaire: QuestionnaireName.IDENTITY_VERIFICATION,
    conditions: {
      and: [
        { '!': { ...providerWalkedInAppointmentIsConfirmed } },
        { ...hasNotVerifiedIdentity },
        { '!': { ...birthControlCareSelected } },
        { '!': { ...edCareSelected } },
        { '!': { ...edHLCareSelected } },
        { '!': { ...menopauseCareSelected } },
        { '!': { ...hairLossCareSelected } },
        { '!': { ...asyncMentalHealthCareSelected } },
        { '!': { ...weightLossCareSelected } },
        { '!': { ...acneCareSelected } },
        { '!': { ...antiAgingCareSelected } },
        { '!': { ...rosaceaCareSelected } },
        { '!': { ...melasmaCareSelected } },
        { '!': { ...enclomipheneSelected } },
        { '!': { ...preWorkoutSelected } },
        { '!': { ...femaleHairLossCareSelected } },
      ],
    },
  },
  {
    questionnaire: QuestionnaireName.VOUCHED_VERIFICATION,
    conditions: {
      and: [
        { ...acneCareSelected },
        { ...antiAgingCareSelected },
        { ...rosaceaCareSelected },
        { ...melasmaCareSelected },
        { '!': { ...enclomipheneSelected } },
        { '!': { ...femaleHairLossCareSelected } },
      ],
    },
  },

  // Weight Loss Post Checkout
  {
    questionnaire: QuestionnaireName.WEIGHT_LOSS_CHECKOUT_SUCCESS,
    conditions: weightLossCareSelected,
  },
  // {
  //   questionnaire: QuestionnaireName.PHARMACY_PREFERENCE,
  //   conditions: {
  //     and: [
  //       { '!': { ...semaglutideAndTirzepatideBundled } },
  //       { '!': { ...oralSemaglutideBundled } },
  //       { ...weightLossCareSelected },
  //     ],
  //   },
  // },
  {
    questionnaire: QuestionnaireName.DELIVERY_ADDRESS,
    conditions: {
      and: [
        { '!': { ...semaglutideAndTirzepatideBundled } },
        { '!': { ...oralSemaglutideBundled } },
        { ...weightLossCareSelected },
        { '!': { ...isVariant5484VariationOne } },
        { '!': { ...isVariant5484VariationTwo } },
        { ...isWeightLossPostV1 },
      ],
    },
  },
  // {
  //   questionnaire: QuestionnaireName.INSURANCE_INFORMATION,
  //   conditions: {
  //     and: [
  //       { '!': { ...semaglutideAndTirzepatideBundled } },
  //       { '!': { ...oralSemaglutideBundled } },
  //       { ...weightLossCareSelected },
  //     ],
  //   },
  // },
  {
    questionnaire: QuestionnaireName.WEIGHT_LOSS_MEDICAL,
    conditions: {
      and: [
        { '!': { ...semaglutideAndTirzepatideBundled } },
        { '!': { ...oralSemaglutideBundled } },
        { ...weightLossCareSelected },
        { ...isWeightLossPostV1 },
      ],
    },
  },
  {
    questionnaire: QuestionnaireName.WEIGHT_LOSS_POST,
    conditions: {
      and: [
        { '!': { ...semaglutideAndTirzepatideBundled } },
        { '!': { ...oralSemaglutideBundled } },
        { ...weightLossCareSelected },
        { ...isWeightLossPostV1 },
      ],
    },
  },
  {
    questionnaire: QuestionnaireName.WEIGHT_LOSS_POST_V2,
    conditions: {
      and: [
        { '!': { ...semaglutideAndTirzepatideBundled } },
        { '!': { ...oralSemaglutideBundled } },
        { ...weightLossCareSelected },
        { '!': { ...isWeightLossPostV1 } },
      ],
    },
  },
  {
    questionnaire: QuestionnaireName.WEIGHT_LOSS_PREFERENCE,
    conditions: {
      and: [
        { '!': { ...semaglutideAndTirzepatideBundled } },
        { '!': { ...oralSemaglutideBundled } },
        { ...weightLossCareSelected },
        { '!': { ...regionIsFlorida } },
      ],
    },
  },
  {
    questionnaire: QuestionnaireName.WEIGHT_LOSS_PAY,
    conditions: {
      and: [
        { '!': { ...semaglutideAndTirzepatideBundled } },
        { '!': { ...oralSemaglutideBundled } },
        { ...weightLossCareSelected },
      ],
    },
  },
  {
    questionnaire: QuestionnaireName.WEIGHT_LOSS_TREATMENT,
    conditions: {
      and: [
        { '!': { ...semaglutideAndTirzepatideBundled } },
        { '!': { ...oralSemaglutideBundled } },
        { ...weightLossCareSelected },
      ],
    },
  },
  {
    questionnaire: QuestionnaireName.WEIGHT_LOSS_POST_BUNDLED,
    conditions: {
      and: [
        semaglutideAndTirzepatideBundled,
        { '!': { ...oralSemaglutideBundled } },
      ],
    },
  },
  {
    questionnaire: QuestionnaireName.WEIGHT_LOSS_POST_ORAL_SEMAGLUTIDE_BUNDLED,
    conditions: oralSemaglutideBundled,
  },
  {
    questionnaire: QuestionnaireName.WEIGHT_LOSS_BUNDLED_TREATMENT,
    conditions: semaglutideAndTirzepatideBundled,
  },
  // {
  //   questionnaire: QuestionnaireName.VOUCHED_VERIFICATION,
  //   conditions: {
  //     and: [
  //       { '!': { ...semaglutideAndTirzepatideBundled } },
  //       { '!': { ...oralSemaglutideBundled } },
  //       { ...weightLossCareSelected },
  //     ],
  //   },
  // },
  {
    questionnaire: QuestionnaireName.IDENTITY_VERIFICATION,
    conditions: {
      and: [
        { ...hasNotVerifiedIdentity },
        { ...weightLossCareSelected },
        { '!': { ...isVariant5484VariationOne } },
        { '!': { ...isVariant5484VariationTwo } },
        { '!': { ...isVariation8205VariationFour } },
      ],
    },
  },
  {
    questionnaire: QuestionnaireName.VOUCHED_VERIFICATION,
    conditions: {
      and: [{ ...isVariation8205VariationFour }, { ...enclomipheneSelected }],
    },
  },
  {
    questionnaire: QuestionnaireName.VOUCHED_VERIFICATION,
    conditions: {
      and: [
        { ...weightLossCareSelected },
        { ...isVariant5484VariationOne },
        { '!': { ...isVariant5484VariationTwo } },
      ],
    },
  },
  {
    questionnaire: QuestionnaireName.COMPLETE_VISIT,
    conditions: weightLossCareSelected,
  },
  {
    questionnaire: QuestionnaireName.LIVE_PROVIDER_VISIT,
    conditions: {
      and: [{ ...weightLossCareSelected }],
    },
  },
  {
    questionnaire: QuestionnaireName.RESPONSES_REVIEWED,
    conditions: {
      and: [{ ...weightLossCareSelected }],
    },
  },
  {
    questionnaire: QuestionnaireName.NOW_WHAT,
    conditions: oralSemaglutideBundled,
  },
];
