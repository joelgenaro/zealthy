export type ICareSelections = {
  careSelections: CareSelectionMapping[];
  other: string;
};

export enum CareSelectionType {
  PRIMARY_CARE = 'Primary care',
  HAIR_LOSS = 'Hair loss',
  NUTRITION = 'Nutrition',
  ERECTILE_DYSFUNCTION = 'Erectile dysfunction',
  BIRTH_CONTROL = 'Birth control',
  MEDICATION_REFILL = 'Medication refill',
}

// this represents a mapping of care selection options to their corresponding
// database ids in the 'reason_for_visit' table, useful for when we need to
// base app logic off user care selections
export enum CareSelectionMapping {
  PRIMARY_CARE = 1,
  BIRTH_CONTROL = 2,
  WEIGHT_LOSS = 3,
  MENTAL_HEALTH = 4,
  COLD_FLU = 5,
  NOT_SURE = 6,
  OTHER = 7,
  ERECTILE_DYSFUNCTION = 8,
  HAIR_LOSS = 9,
  PRE_WORKOUT = 15,
}

export enum CareSelectionCategory {
  SUBSCRIPTION = 'Subscription',
  CONCERN = 'Concern',
  PRODUCT = 'Product',
  VISIT = 'Visit',
}

export interface ICareSelection {
  id: number;
  name: string;
  price: number;
  type: CareSelectionType;
  categories: CareSelectionCategory[];
}
