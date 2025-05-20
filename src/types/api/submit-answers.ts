import { AnswerItem } from '@/context/AppContext/reducers/types/answer';

export type SubmitAnswersParams = {
  visitId: number;
  questionnaireName: string;
  newAnswers: AnswerItem[];
  canvasId: string;
  codingSystem: string;
};
