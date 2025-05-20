import React, { useCallback } from 'react';
import { Stack } from '@mui/system';
import Option from './Option';
import {
  Questionnaire,
  QuestionnaireQuestionAnswerOptions,
  QuestionWithName,
} from '@/types/questionnaire';
import { useAnswerAction } from '@/components/hooks/useAnswer';
import { CodedAnswer } from '@/context/AppContext/reducers/types/answer';

interface ChoiceProps {
  question: QuestionWithName;
  answer: CodedAnswer[];
  questionnaire: Questionnaire;
}

const ImageChoice = ({ question, questionnaire, answer }: ChoiceProps) => {
  const { submitSingleSelectAnswer } = useAnswerAction({
    name: question.name,
    header: question.header,
    questionnaire: questionnaire.name,
    canvas_linkId: question.canvas_linkId,
    codingSystem: question.codingSystem || questionnaire.codingSystem,
  });

  const handleSubmit = useCallback(
    (answer: QuestionnaireQuestionAnswerOptions) => {
      submitSingleSelectAnswer(answer);
    },
    [submitSingleSelectAnswer]
  );

  return (
    <Stack spacing={2} alignItems="center">
      {question.answerOptions &&
        question.answerOptions.map(option => (
          <Option
            key={option.code!}
            option={option}
            isSelected={answer?.[0]?.valueCoding.code === option.code}
            onSelect={handleSubmit}
          />
        ))}
    </Stack>
  );
};

export default ImageChoice;
