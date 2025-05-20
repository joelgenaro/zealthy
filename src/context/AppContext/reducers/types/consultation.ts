import { CommonAction } from './common';

export enum ConsultationType {
  ACNE = 'Acne',
  ANTI_AGING = 'Anti-Aging',
  MELASMA = 'Melasma',
  ROSACEA = 'Rosacea',
  SKINCARE = 'Skincare',
  PREP = 'Prep',
  MENOPAUSE = 'Menopause',
}

export type ConsultationState = {
  name: string;
  price: number;
  discounted_price?: number;
  type: ConsultationType;
  concerns?: string[];
};

export enum ConsultationActionTypes {
  ADD_CONSULTATION = 'ADD_CONSULTATION',
  REMOVE_CONSULTATION = 'REMOVE_CONSULTATION',
  REMOVE_CONSULTATIONV2 = 'REMOVE_CONSULTATIONV2',
  CLEAR_CONSULTATION = 'CLEAR_CONSULTATIONS',
}

export type ConsultationActions =
  | CommonAction
  | {
      type: ConsultationActionTypes.ADD_CONSULTATION;
      payload: ConsultationState;
    }
  | {
      type: ConsultationActionTypes.REMOVE_CONSULTATION;
      payload: ConsultationType;
    }
  | {
      type: ConsultationActionTypes.REMOVE_CONSULTATIONV2;
    }
  | { type: ConsultationActionTypes.CLEAR_CONSULTATION };
