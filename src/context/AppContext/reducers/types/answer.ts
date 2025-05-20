import {
  QuestionnaireQuestionAnswerOptions,
  QuestionFollowUp,
} from '@/types/questionnaire';
import { CommonAction } from './common';

export type CodedAnswer = {
  valueCoding: {
    display: string;
    code: string;
    system?: string;
    next?: string;
  };
};

export type FreeTextAnswer = {
  valueString: string;
  valueCoding?: any;
};

export type AnswerItem = {
  questionnaire: string;
  name: string;
  linkId?: string;
  text: string;
  codingSystem?: string;
  answer: CodedAnswer[] | FreeTextAnswer[];
  answerOptions?: QuestionnaireQuestionAnswerOptions[];
  followUp?: QuestionFollowUp;
};

export type AnswerState = {
  [key: string]: AnswerItem;
};

export enum AnswerActionsType {
  SET_ANSWERS = 'SET_ANSWERS',
  ADD_ANSWER = 'ADD_ANSWER',
  CLEAR_ANSWERS = 'CLEAR_ANSWERS',
  REMOVE_ANSWERS = 'REMOVE_ANSWERS',
}

export type AnswerAction =
  | CommonAction
  | {
      type: AnswerActionsType.ADD_ANSWER;
      payload: AnswerItem;
    }
  | {
      type: AnswerActionsType.CLEAR_ANSWERS;
    }
  | {
      type: AnswerActionsType.SET_ANSWERS;
      payload: AnswerState;
    }
  | {
      type: AnswerActionsType.REMOVE_ANSWERS;
      payload: string[];
    };

export type QuestionnaireResponse = {};
