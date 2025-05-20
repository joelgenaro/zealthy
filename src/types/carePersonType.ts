export enum CarePersonType {
  PRESCRIBER = 'prescriber',
  THERAPIST = 'therapist',
  MENTAL_HEALTH = 'Coach (Mental Health)',
  WEIGHT_LOSS = 'Coach (Weight Loss)',
  RN = 'RN',
}

export type CoachType =
  | CarePersonType.MENTAL_HEALTH
  | CarePersonType.WEIGHT_LOSS;
