import { CommonAction } from './common';

export enum IntakeActionTypes {
  ADD_ALLERGIES = 'ADD_ALLERGIES',
  ADD_CONDITIONS = 'ADD_CONDITIONS',
  ADD_MEDICATIONS = 'ADD_MEDICATIONS',
  REMOVE_MEDICATIONS = 'REMOVE_MEDICATIONS',
  ADD_SPECIFIC_CARE = 'ADD_SPECIFIC_CARE',
  REMOVE_SPECIFIC_CARE = 'REMOVE_SPECIFIC_CARE',
  ADD_POTENTIAL_INSURANCE = 'ADD_POTENTIAL_INSURANCE',
  ADD_VARIANT = 'ADD_VARIANT',
  ADD_CONCERNING_SYMPTOM = 'ADD_CONCERNING_SYMPTOM',
  REMOVE_CONCERNING_SYMPTOM = 'REMOVE_CONCERNING_SYMPTOM',
  RESET_CONCERNING_SYMPTOMS = 'RESET_CONCERNING_SYMPTOMS',
  ADD_DEFAULT_ACCOMPLISH = 'ADD_DEFAULT_ACCOMPLISH',
  REMOVE_DEFAULT_ACCOMPLISH = 'REMOVE_DEFAULT_ACCOMPLISH',
  RESET_DEFAULT_ACCOMPLISH = 'RESET_DEFAULT_ACCOMPLISH',
  ADD_MENTAL_HEALTH = 'ADD_MENTAL_HEALTH',
  ADD_ASYNC_MENTAL_HEALTH = 'ADD_ASYNC_MENTAL_HEALTH',
  REMOVE_MENTAL_HEALTH = 'REMOVE_MENTAL_HEALTH',
  REMOVE_ASYNC_MENTAL_HEALTH = 'REMOVE_ASYNC_MENTAL_HEALTH',
  RESET_MENTAL_HEALTH = 'RESET_MENTAL_HEALTH',
  RESET_ASYNC_MENTAL_HEALTH = 'RESET_ASYNC_MENTAL_HEALTH',
  ADD_PRIMARY_CARE = 'ADD_PRIMARY_CARE',
  REMOVE_PRIMARY_CARE = 'REMOVE_PRIMARY_CARE',
  RESET_PRIMARY_CARE = 'RESET_PRIMARY_CARE',
  ADD_VIRTUAL_URGENT_CARE = 'ADD_VIRTUAL_URGENT_CARE',
  REMOVE_VIRTUAL_URGENT_CARE = 'REMOVE_VIRTUAL_URGENT_CARE',
  RESET_VIRTUAL_URGENT_CARE = 'RESET_VIRTUAL_URGENT_CARE',
  ADD_HAIR_LOSS = 'ADD_HAIR_LOSS',
  REMOVE_HAIR_LOSS = 'REMOVE_HAIR_LOSS',
  RESET_HAIR_LOSS = 'RESET_HAIR_LOSS',
  SET_ILV_ENABLED = 'SET_ILV_ENABLED',
  ADD_ENCLOMIPHENE = 'ADD_ENCLOMIPHENE',
  REMOVE_ENCLOMIPHENE = 'REMOVE_ENCLOMIPHENE',
  RESET_ENCLOMIPHENE = 'RESET_ENCLOMIPHENE',
  ADD_PRE_WORKOUT = 'ADD_PRE_WORKOUT',
  REMOVE_PRE_WORKOUT = 'REMOVE_PRE_WORKOUT',
  RESET_PRE_WORKOUT = 'RESET_PRE_WORKOUT',
  ADD_WEIGHT_LOSS = 'ADD_WEIGHT_LOSS',
  REMOVE_WEIGHT_LOSS = 'REMOVE_WEIGHT_LOSS',
  RESET_WEIGHT_LOSS = 'RESET_WEIGHT_LOSS',
}

export enum ConcerningSymptoms {
  FEVER = 'Fever above 102 degrees Fahrenheit',
  SHORTNESS_OF_BREATH = 'Shortness of breath, history of asthma or COPD',
  CHEST_PAIN = 'Severe chest or stomach pain',
  DEHYDRATION = 'Dehydration',
}

export enum SpecificCareOption {
  DEFAULT = 'Default',
  HAIR_LOSS = 'Hair loss',
  WEIGHT_LOSS = 'Weight loss',
  WEIGHT_LOSS_ACCESS = 'Weight loss access',
  WEIGHT_LOSS_ACCESS_V2 = 'Weight loss access v2',
  WEIGHT_LOSS_AD = 'Weight loss ad',
  BIRTH_CONTROL = 'Birth control',
  ANXIETY_OR_DEPRESSION = 'Anxiety or depression',
  ASYNC_MENTAL_HEALTH = 'Mental health',
  ERECTILE_DYSFUNCTION = 'Erectile dysfunction',
  PRIMARY_CARE = 'Primary care',
  VIRTUAL_URGENT_CARE = 'Virtual Urgent Care',
  ACNE = 'Acne',
  ANTI_AGING = 'Fine Lines & Wrinkles',
  MELASMA = 'Hyperpigmentation Dark Spots',
  ROSACEA = 'Rosacea',
  SKINCARE = 'Skincare',
  OTHER = 'Other',
  ENCLOMIPHENE = 'Enclomiphene',
  PRE_WORKOUT = 'Preworkout',
  FEMALE_HAIR_LOSS = 'Hair Loss',
  PREP = 'Prep',
  SLEEP = 'Sleep',
  WEIGHT_LOSS_FREE_CONSULT = 'Weight Loss Free Consult',
  SEX_PLUS_HAIR = 'Sex + Hair',
  MENOPAUSE = 'Menopause',
}

export enum PotentialInsuranceOption {
  OH = 'OH',
  TX = 'TX',
  OUT_OF_NETWORK_V2 = 'OON2',
  OUT_OF_NETWORK = 'OON',
  DEFAULT = 'Default',
  AETNA = 'Aetna',
  MEDICARE = 'Medicare',
  BLUE_CROSS_ILLINOIS = 'BCIL',
  MEDICARE_ACCESS_FLORIDA = 'Medicare Access Florida',
  MEDICAID_ACCESS_FLORIDA = 'Medicaid Access Florida',
  SEMAGLUTIDE_BUNDLED = 'Semaglutide Bundled',
  ORAL_SEMAGLUTIDE_BUNDLED = 'Semaglutide Bundled Oral Pills',
  TIRZEPATIDE_BUNDLED = 'Tirzepatide Bundled',
  WEIGHT_LOSS_SYNC = 'Weight Loss Sync',
  FIRST_MONTH_FREE = 'First Month Free',
  ED_HARDIES = 'Hardies',
  ADDITIONAL_PA = 'Additional PA',
  MENTAL_HEALTH_REFILL_REQUEST = 'Mental Health Refill Request',
  WEIGHT_LOSS_CONTINUE = 'Weight Loss Continue',
  // WEIGHT_LOSS_RO = 'Weight Loss Ro',
}

export enum DefaultAccomplishOptions {
  PHYSICAL_HEALTH = 'Improve general physical health',
  LASTING_WEIGHT_LOSS = 'Achieve lasting weight loss',
  PARTICULAR_MEDS = 'Get a particular medication or refill',
  SPECIFIC_CONDITION = 'Improve symptoms of a specific condition',
  APPOINTMENT = 'Get a same-day or next-day doctor’s appointment',
  IMPROVE_MENTAL_HEALTH = 'Improve mental health',
  PRESCRIPTIONS = 'Get prescription and at-home delivery',
}

export enum PrimaryCareOptions {
  PHYSICAL_HEALTH = 'Improve general physical health',
  SPECIFIC_CONDITION = 'Improve symptoms of a specific condition',
  PRIMARY_CARE = 'Find a primary care provider',
  PARTICULAR_MEDS = 'Get a particular medication or refill',
}

export enum VirtualUrgentCareOptions {
  COLD_OR_FLU = 'Cold or flu like symptoms',
  SKIN_PROBLEMS = 'Skin rashes or insect bites',
  URINARY_TRACT = 'Urinary tract infection',
  JOINT_OR_MUSCLE = 'Joint sprint or muscle strain',
}

export enum WeightLossOptions {
  LOSE_WEIGHT = 'Lose weight',
  INSURANCE_MED = 'Help get insurance to cover GLP-1 medication',
  SPECIFIC_MED = 'Get specific weight loss medication',
  GLP_MED = 'Get GLP-1 medication without using insurance',
  INCREASE_CONFIDENCE = 'Increase confidence about my appearance',
  INCREASE_ACTIVE = 'Increase my ability to be active',
  RO_LOSE_WEIGHT = 'Lose weight',
  RO_IMPROVE_HEALTH = 'Improve my general physical health',
  RO_IMPROVE_CONDITION = 'Improve another health condition',
  RO_IMPROVE_CONFIDENCE = 'Increase confidence about my appearance',
  RO_INCREASE_ACTIVE = 'Increase energy for activities I enjoy',
}

export enum MentalHealthOptions {
  IMPROVE_MENTAL = 'Improve my mental health or wellbeing',
  IMPROVE_SYMPTOMS_ANXIETY = 'Improve symptoms of my anxiety',
  IMPROVE_SYMPTOMS_OTHER = 'Improve symptoms of a different mental health challenge',
  INCREASE_SATISFACTION = 'Increase my overall daily satisfaction',
  FIND_CLINICIAN = 'Find mental health clinician or coach',
  PSYCHIATRIST = 'Find psychiatrist',
  PARTICULAR_MEDS = 'Get a particular medication or refill',
}

export enum AsyncMentalHealthOptions {
  MEDICATION = 'Get specific mental health medication filled or refilled',
  WELLBEING = 'Improve my mental health or wellbeing',
  IMPROVE_SYMPTOMS = 'Improve symptoms of a specific mental health condition',
  DAILY_SATISFACTION = 'Increase my overall daily satisfaction',
  FIND_COACH = 'Find mental health clinician or coach',
  GET_DIAGNOSIS = 'Get a diagnosis for my mental health',
  CHECK_IN = 'Check in with myself and see how I’m doing',
  ANOTHER_GOAL = 'I have another goal not listed here',
}

export enum AsyncMentalHealthTimelineOptions {
  FEW_MONTHS = 'The past few months',
  PAST_YEAR = 'The past year',
  FEW_YEARS = 'A few years ago',
  FIVE_YEARS = 'Over 5 years ago',
  LONGER_THAN_REMEMBER = 'Longer than I can remember',
  UNSURE = "Unsure. It's been on and off",
}

export enum HairLossOptions {
  PREVENT_LOSS = 'Maintain hair and prevent hair loss',
  REGROW_HAIR = 'Regrow hair',
  PARTICULAR_MEDS = 'Get a particular medication or refill',
  PRIMARY_CARE = 'Find primary care provider',
}

export enum EnclomipheneOptions {
  BODY_COMPOSITION = 'I want to improve my body composition',
  LIBIDO = 'I want higher libido (better erections)',
  CONFIDENCE = 'I want to be more confident and assertive',
  FEEL_CALM = 'I want to feel more calm and relaxed',
}

export enum PreWorkoutOptions {
  MALE = 'Male',
  FEMALE = 'Female',
}

export type IntakeAction =
  | CommonAction
  | {
      type: IntakeActionTypes.ADD_MEDICATIONS;
      payload: { [medication_name: string]: string };
    }
  | {
      type: IntakeActionTypes.REMOVE_MEDICATIONS;
      payload: { [medication_name: string]: boolean };
    }
  | {
      type:
        | IntakeActionTypes.ADD_ALLERGIES
        | IntakeActionTypes.ADD_CONDITIONS
        | IntakeActionTypes.ADD_CONCERNING_SYMPTOM
        | IntakeActionTypes.REMOVE_CONCERNING_SYMPTOM
        | IntakeActionTypes.REMOVE_DEFAULT_ACCOMPLISH
        | IntakeActionTypes.REMOVE_PRIMARY_CARE
        | IntakeActionTypes.REMOVE_VIRTUAL_URGENT_CARE
        | IntakeActionTypes.REMOVE_WEIGHT_LOSS
        | IntakeActionTypes.REMOVE_MENTAL_HEALTH
        | IntakeActionTypes.REMOVE_ASYNC_MENTAL_HEALTH
        | IntakeActionTypes.REMOVE_HAIR_LOSS
        | IntakeActionTypes.REMOVE_ENCLOMIPHENE
        | IntakeActionTypes.REMOVE_PRE_WORKOUT;
      payload: string;
    }
  | {
      type: IntakeActionTypes.ADD_SPECIFIC_CARE;
      payload: SpecificCareOption | null;
    }
  | {
      type: IntakeActionTypes.ADD_POTENTIAL_INSURANCE;
      payload: PotentialInsuranceOption | null;
    }
  | {
      type: IntakeActionTypes.ADD_VARIANT;
      payload: string | null;
    }
  | {
      type: IntakeActionTypes.ADD_DEFAULT_ACCOMPLISH;
      payload: DefaultAccomplishOptions;
    }
  | {
      type: IntakeActionTypes.ADD_PRIMARY_CARE;
      payload: PrimaryCareOptions;
    }
  | {
      type: IntakeActionTypes.ADD_VIRTUAL_URGENT_CARE;
      payload: VirtualUrgentCareOptions;
    }
  | {
      type: IntakeActionTypes.ADD_WEIGHT_LOSS;
      payload: WeightLossOptions;
    }
  | {
      type: IntakeActionTypes.ADD_MENTAL_HEALTH;
      payload: MentalHealthOptions;
    }
  | {
      type: IntakeActionTypes.ADD_ASYNC_MENTAL_HEALTH;
      payload: AsyncMentalHealthOptions;
    }
  | {
      type: IntakeActionTypes.ADD_HAIR_LOSS;
      payload: HairLossOptions;
    }
  | {
      type: IntakeActionTypes.RESET_CONCERNING_SYMPTOMS;
    }
  | {
      type: IntakeActionTypes.RESET_DEFAULT_ACCOMPLISH;
    }
  | {
      type: IntakeActionTypes.RESET_PRIMARY_CARE;
    }
  | {
      type: IntakeActionTypes.RESET_VIRTUAL_URGENT_CARE;
    }
  | {
      type: IntakeActionTypes.RESET_WEIGHT_LOSS;
    }
  | {
      type: IntakeActionTypes.RESET_MENTAL_HEALTH;
    }
  | {
      type: IntakeActionTypes.RESET_ASYNC_MENTAL_HEALTH;
    }
  | {
      type: IntakeActionTypes.RESET_HAIR_LOSS;
    }
  | {
      type: IntakeActionTypes.RESET_ENCLOMIPHENE;
    }
  | { type: IntakeActionTypes.REMOVE_SPECIFIC_CARE }
  | {
      type: IntakeActionTypes.SET_ILV_ENABLED;
      payload: boolean;
    }
  | {
      type: IntakeActionTypes.ADD_ENCLOMIPHENE;
      payload: EnclomipheneOptions;
    }
  | {
      type: IntakeActionTypes.ADD_PRE_WORKOUT;
      payload: PreWorkoutOptions;
    }
  | {
      type: IntakeActionTypes.RESET_PRE_WORKOUT;
    };

export interface IntakeState {
  conditions: string;
  allergies: string;
  medications: { [medication_name: string]: string };
  specificCare: SpecificCareOption | null;
  potentialInsurance: PotentialInsuranceOption | null;
  variant: string | null;
  concerningSymptoms: string[];
  defaultAccomplish: DefaultAccomplishOptions[];
  primaryCare: PrimaryCareOptions[];
  virtualUrgentCare: VirtualUrgentCareOptions[];
  weightLoss: WeightLossOptions[];
  mentalHealth: MentalHealthOptions[];
  asyncMentalHealth: AsyncMentalHealthOptions[];
  hairLoss: HairLossOptions[];
  ilvEnabled: boolean;
  enclomiphene: EnclomipheneOptions[];
  preWorkout: PreWorkoutOptions[];
}
