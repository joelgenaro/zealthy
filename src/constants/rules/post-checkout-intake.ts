export const visitIsSync = {
  '===': [{ var: 'visit.isSync' }, true],
};

export const providerScheduledAppointmentIsConfirmed = {
  some: [
    { var: 'appointments' },
    {
      and: [
        { '===': [{ var: 'encounter_type' }, 'Scheduled'] },
        { '===': [{ var: 'status' }, 'Confirmed'] },
        { '===': [{ var: 'appointment_type' }, 'Provider'] },
      ],
    },
  ],
};

export const alwaysTrue = {
  '===': [true, true],
};

export const providerWalkedInAppointmentIsConfirmed = {
  some: [
    { var: 'appointments' },
    {
      and: [
        { '===': [{ var: 'encounter_type' }, 'Walked-in'] },
        { '===': [{ var: 'status' }, 'Unassigned'] }, //for ILV unassigned is a variation of confirmed
        { '===': [{ var: 'appointment_type' }, 'Provider'] },
      ],
    },
  ],
};

export const hasNotVerifiedIdentity = {
  '===': [{ var: 'patient.has_verified_identity' }, false],
};

export const alwaysExceptWeightLoss = {
  none: [{ var: 'reasons' }, { '===': [{ var: 'reason' }, 'Weight loss'] }],
};

export const alwaysExceptSkincare = {
  none: [
    { var: 'reasons' },
    {
      in: [
        { var: 'reason' },
        [
          'Acne',
          'Fine Lines & Wrinkles',
          'Hyperpigmentation Dark Spots',
          'Rosacea',
        ],
      ],
    },
  ],
};

export const alwaysExceptMentalHealth = {
  none: [
    { var: 'reasons' },
    { '===': [{ var: 'reason' }, 'Anxiety or depression'] },
  ],
};

export const alwaysExceptBirthControl = {
  none: [{ var: 'reasons' }, { '===': [{ var: 'reason' }, 'Birth control'] }],
};

export const mentalHealthCareSelected = {
  some: [
    { var: 'reasons' },
    { '===': [{ var: 'reason' }, 'Anxiety or depression'] },
  ],
};

export const asyncMentalHealthCareSelected = {
  some: [{ var: 'reasons' }, { '===': [{ var: 'reason' }, 'Mental health'] }],
};

export const preWorkoutSelected = {
  some: [{ var: 'reasons' }, { '===': [{ var: 'reason' }, 'Preworkout'] }],
};

export const weightLossCareSelected = {
  some: [{ var: 'reasons' }, { '===': [{ var: 'reason' }, 'Weight loss'] }],
};

export const birthControlCareSelected = {
  some: [{ var: 'reasons' }, { '===': [{ var: 'reason' }, 'Birth control'] }],
};

export const hairLossCareSelected = {
  some: [{ var: 'reasons' }, { '===': [{ var: 'reason' }, 'Hair loss'] }],
};

export const femaleHairLossCareSelected = {
  some: [{ var: 'reasons' }, { '===': [{ var: 'reason' }, 'Hair Loss'] }],
};

export const edCareSelected = {
  some: [
    { var: 'reasons' },
    { '===': [{ var: 'reason' }, 'Erectile dysfunction'] },
  ],
};

export const edHLCareSelected = {
  some: [{ var: 'reasons' }, { '===': [{ var: 'reason' }, 'Sex + Hair'] }],
};

export const menopauseCareSelected = {
  some: [{ var: 'reasons' }, { '===': [{ var: 'reason' }, 'Menopause'] }],
};

export const acneCareSelected = {
  some: [{ var: 'reasons' }, { '===': [{ var: 'reason' }, 'Acne'] }],
};
export const antiAgingCareSelected = {
  some: [
    { var: 'reasons' },
    { '===': [{ var: 'reason' }, 'Fine Lines & Wrinkles'] },
  ],
};
export const melasmaCareSelected = {
  some: [
    { var: 'reasons' },
    { '===': [{ var: 'reason' }, 'Hyperpigmentation Dark Spots'] },
  ],
};
export const rosaceaCareSelected = {
  some: [{ var: 'reasons' }, { '===': [{ var: 'reason' }, 'Rosacea'] }],
};

export const skinCareSelected = {
  some: [
    { var: 'reasons' },
    {
      or: [
        { '===': [{ var: 'reason' }, 'Acne'] },
        { '===': [{ var: 'reason' }, 'Fine Lines & Wrinkles'] },
        { '===': [{ var: 'reason' }, 'Hyperpigmentation Dark Spots'] },
        { '===': [{ var: 'reason' }, 'Rosacea'] },
      ],
    },
  ],
};

export const enclomipheneSelected = {
  some: [{ var: 'reasons' }, { '===': [{ var: 'reason' }, 'Enclomiphene'] }],
};

export const mentalHealthCoachPlanNotSelected = {
  none: [{ var: 'coaching' }, { '===': [{ var: 'type' }, 'MENTAL_HEALTH'] }],
};

export const mentalHealthCoachPlanSelected = {
  some: [{ var: 'coaching' }, { '===': [{ var: 'type' }, 'MENTAL_HEALTH'] }],
};

export const weightLossCoachPlanSelected = {
  some: [{ var: 'coaching' }, { '===': [{ var: 'type' }, 'WEIGHT_LOSS'] }],
};

export const psychiatryCoachPlanSelected = {
  some: [
    { var: 'coaching' },
    { '===': [{ var: 'type' }, 'PERSONALIZED_PSYCHIATRY'] },
  ],
};

export const female = {
  '===': [{ var: 'profile.gender' }, 'female'],
};

export const lessThan50 = {
  '<': [{ var: 'profile.age' }, 50],
};

export const regionNotCalifornia = {
  '!==': [{ var: 'patient.region' }, 'CA'],
};

export const regionIsGeorgia = {
  '===': [{ var: 'patient.region' }, 'GA'],
};

export const regionIsFlorida = {
  '===': [{ var: 'patient.region' }, 'FL'],
};

export const hasINInsurance = {
  '===': [{ var: 'insurance.hasINInsurance' }, true],
};

export const edOnly = {
  all: [
    { var: 'reasons' },
    { '===': [{ var: 'reason' }, 'Erectile dysfunction'] },
  ],
};

export const hairLossOnly = {
  all: [{ var: 'reasons' }, { '===': [{ var: 'reason' }, 'Hair loss'] }],
};

export const birthControlOnly = {
  all: [{ var: 'reasons' }, { '===': [{ var: 'reason' }, 'Birth control'] }],
};

export const weightLossOnly = {
  all: [{ var: 'reasons' }, { '===': [{ var: 'reason' }, 'Weight loss'] }],
};

export const providerScheduledAppointmentIsNotConfirmed = {
  some: [
    { var: 'appointments' },
    {
      and: [
        { '===': [{ var: 'appointment_type' }, 'Provider'] },
        { '===': [{ var: 'encounter_type' }, 'Scheduled'] },
        { in: [{ var: 'status' }, ['Requested', 'Rejected']] },
      ],
    },
  ],
};

export const providerWalkedInAppointmentIsNotConfirmed = {
  some: [
    { var: 'appointments' },
    {
      and: [
        { '===': [{ var: 'appointment_type' }, 'Provider'] },
        { '===': [{ var: 'encounter_type' }, 'Walked-in'] },
        { in: [{ var: 'status' }, ['Requested', 'Rejected']] },
      ],
    },
  ],
};

export const semaglutideAndTirzepatideBundled = {
  in: [
    { var: 'potentialInsurance' },
    ['Semaglutide Bundled', 'Tirzepatide Bundled'],
  ],
};

export const oralSemaglutideBundled = {
  in: [{ var: 'potentialInsurance' }, ['Semaglutide Bundled Oral Pills']],
};

export const isVariation4687VariantTwo = {
  '===': [{ var: 'variationName4687' }, 'Variation-2'],
};

export const isVariation8205VariationFour = {
  '===': [{ var: 'variationName8205' }, 'Variation-4'],
};

export const isVariant5484VariationOne = {
  '===': [{ var: 'variationName5484' }, 'Variation-1'],
};

export const isVariant5484VariationTwo = {
  '===': [{ var: 'variationName5484' }, 'Variation-2'],
};

export const isWeightLossPostV1 = {
  '===': [{ var: 'visit.questionnaires.0.name' }, 'weight-loss'],
};
