import { AnswerItem } from '@/context/AppContext/reducers/types/answer';
import { Database } from '@/lib/database.types';

export type Patient = {
  id: number;
  canvas_patient_id: string | null;
};

export type DiagnosisCode = {
  name: string;
  code: string;
} | null;

export type Response = {
  items: AnswerItem[];
};

export type QuestionnaireResponse =
  Database['public']['Tables']['questionnaire_response']['Row'];
