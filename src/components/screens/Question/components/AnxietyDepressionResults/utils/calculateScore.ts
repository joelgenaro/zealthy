import {
  AnswerItem,
  CodedAnswer,
} from '@/context/AppContext/reducers/types/answer';

export const totalScore = {
  'phq-9': 27,
  'gad-7': 21,
};

const calculator: { [key: string]: number } = {
  'Nearly every day': 3,
  'More than half the days': 2,
  'Several days': 1,
  'Not at all': 0,
};

export const calculateScore = (answers: AnswerItem[]) => {
  return answers
    .map(({ answer }) =>
      (answer as CodedAnswer[]).map(a => a.valueCoding.display)
    )
    .flat()
    .reduce((acc, answer) => {
      const score = calculator[answer] || 0;
      acc += score;
      return acc;
    }, 0);
};
