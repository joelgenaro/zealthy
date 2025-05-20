import { Database } from '@/lib/database.types';
import { IntakeType } from '@/utils/getIntakesForVisit-v2';
import { AnswerItem } from './answer';
import { StaticImageData } from 'next/image';
import { CommonAction } from './common';

export enum MedicationType {
  BIRTH_CONTROL = 'BIRTH_CONTROL',
  ED = 'ED',
  HAIR_LOSS = 'HAIR_LOSS',
  HAIR_LOSS_ADD_ON = 'HAIR_LOSS_ADD_ON',
  EMERGENCY_BIRTH_CONTROL = 'EMERGENCY_BIRTH_CONTROL',
  ACNE = 'Acne',
  ANTI_AGING = 'Anti-Aging',
  MELASMA = 'Melasma',
  ROSACEA = 'Rosacea',
  SKINCARE = 'Skincare',
  WEIGHT_LOSS = 'WEIGHT_LOSS',
  WEIGHT_LOSS_GLP1_INJECTABLE = 'WEIGHT_LOSS_GLP1 (INJECTABLE)',
  WEIGHT_LOSS_GLP1_ORAL = 'WEIGHT_LOSS_GLP1 (ORAL)',
  MENTAL_HEALTH = 'Mental health',
  ENCLOMIPHENE = 'Enclomiphene',
  PRE_WORKOUT = 'Preworkout',
  FEMALE_HAIR_LOSS = 'Female hair loss',
  SEX_PLUS_HAIR = 'Sex + Hair',
  SLEEP = 'Sleep',
  MENOPAUSE = 'Menopause',
}

export type OtherOption = {
  quantity: number;
  price: number;
  discounted_price?: number;
  label: string;
  subheader?: string;
  medication_quantity_id: number;
  recurring: {
    interval: string;
    interval_count: number;
  };
};

export type Medication = {
  plan?: string | null;
  type: MedicationType;
  medication_quantity_id: number | null;
  name: string;
  price?: number;
  discounted_price?: number;
  display_name?: string;
  quantity?: number;
  dosage?: string;
  otherOptions?: OtherOption[];
  note?: string;
  dose?: string | null;
  mgSavings?: string | null;
  singlePaymentTitle?: string | null;
  recurring: {
    interval: string; //months
    interval_count: number; //how often
  };
  currMonth?: number | null;
  image?: string | StaticImageData;
  description?: string;
  loveIt?: any;
  details?: string[];
  instructions?: any;
  value?: number;
  matrixId?: number;
  vial_size?: string | null;
  renewing_prescription?: number;
};

export type ReasonForVisit = Pick<
  Database['public']['Tables']['reason_for_visit']['Row'],
  'id' | 'reason' | 'synchronous'
>;

export type VisitPayload = {
  id: number;
  isSync: boolean;
  careSelected: ReasonForVisit[];
  intakes: IntakeType[];
};

export type QuestionnaireResponse = {
  questionnaire_canvas_id: string;
  answers: AnswerItem[];
};

export type SelectedCare = {
  careSelections: ReasonForVisit[];
  other: string;
};

export type AddCarePayload = {
  care: SelectedCare;
  updateQuestionnaires?: boolean;
};

export type VisitQuestionnaireType = {
  name: string;
  entry: string | null;
  intro: boolean;
  care?: ReasonForVisit['reason'];
};

export type VisitState = {
  id: number | null;
  isSync: boolean;
  selectedCare: SelectedCare;
  medications: Medication[];
  questionnaires: VisitQuestionnaireType[];
  intakes: IntakeType[];
};

export enum VisitTypeActions {
  ADD_VISIT_ID = 'ADD_VISIT_ID',
  ADD_CARE = 'ADD_CARE',
  ADD_ASYNC = 'ADD_ASYNC',
  ADD_MEDICATION = 'ADD_MEDICATION',
  ADD_MEDICATIONS = 'ADD_MEDICATIONS',
  REMOVE_MEDICATION = 'REMOVE_MEDICATION',
  ADD_MEDICATION_UPDATE = 'ADD_MEDICATION_UPDATE',
  ADD_COACHING = 'ADD_COACHING',
  REMOVE_COACHING = 'REMOVE_COACHING',
  ADD_QUESTIONNAIRES = 'ADD_QUESTIONNAIRES',
  ADD_QUESTIONNAIRE = 'ADD_QUESTIONNAIRE',
  REMOVE_QUESTIONNAIRE = 'REMOVE_QUESTIONNAIRE',
  RESET_QUESTIONNAIRES = 'RESET_QUESTIONNAIRES',
  UPDATE_VISIT = 'UPDATE_VISIT',
  ADD_SPECIFIC_CARE = 'ADD_SPECIFIC_CARE',
  RESET_MEDICATIONS = 'RESET_MEDICATIONS',
}

export type VisitActions =
  | CommonAction
  | {
      type: VisitTypeActions.ADD_CARE;
      payload: AddCarePayload;
    }
  | {
      type: VisitTypeActions.ADD_ASYNC;
      payload: boolean;
    }
  | {
      type: VisitTypeActions.ADD_MEDICATION;
      payload: Medication;
    }
  | {
      type: VisitTypeActions.ADD_MEDICATIONS;
      payload: Medication[];
    }
  | {
      type: VisitTypeActions.REMOVE_MEDICATION;
      payload: MedicationType;
    }
  | {
      type: VisitTypeActions.RESET_MEDICATIONS;
    }
  | {
      type: VisitTypeActions.UPDATE_VISIT;
      payload: Partial<VisitState>;
    }
  | {
      type: VisitTypeActions.ADD_QUESTIONNAIRES;
      payload: VisitQuestionnaireType[];
    }
  | {
      type: VisitTypeActions.ADD_QUESTIONNAIRE;
      payload: VisitQuestionnaireType;
    }
  | {
      type: VisitTypeActions.REMOVE_QUESTIONNAIRE;
      payload: string;
    }
  | {
      type: VisitTypeActions.RESET_QUESTIONNAIRES;
    }
  | {
      type: VisitTypeActions.ADD_VISIT_ID;
      payload: number;
    }
  | {
      type: VisitTypeActions.ADD_MEDICATION_UPDATE;
      payload: {
        type: MedicationType;
        update: Partial<VisitState['medications'][number]>;
      };
    };
