import { CommonAction } from './common';

export interface QuestionResult {
  name: string;
  values?: string[];
  detail?: string;
}

export type QuestionsState = Record<string, QuestionResult[]>;

export enum QuestionsActionTypes {
  SAVE_QUESTION = 'SAVE_QUESTION',
}

export type QuestionsAction =
  | CommonAction
  | {
      type: QuestionsActionTypes.SAVE_QUESTION;
      payload: SaveQuestionParams;
    };

export interface SaveQuestionParams {
  category: string;
  result: QuestionResult;
  next?: string;
}
