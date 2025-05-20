import {
  CodedAnswer,
  FreeTextAnswer,
} from '@/context/AppContext/reducers/types/answer';

type Answer = CodedAnswer[] | FreeTextAnswer[];

export const isCodedAnswer = (answer: Answer): answer is CodedAnswer[] => {
  return (
    Array.isArray(answer) && answer.length > 0 && 'valueCoding' in answer[0]
  );
};
