import {
  CodedAnswer,
  FreeTextAnswer,
} from '@/context/AppContext/reducers/types/answer';

type Answer = CodedAnswer[] | FreeTextAnswer[];

export const isFreeTextAnswer = (
  answer: Answer
): answer is FreeTextAnswer[] => {
  return 'valueString' in answer?.[0];
};
