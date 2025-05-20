import { useAnswerAction, useAnswerAsync } from '@/components/hooks/useAnswer';
import { CodedAnswer } from '@/context/AppContext/reducers/types/answer';
import {
  Questionnaire,
  QuestionnaireQuestionAnswerOptions,
  QuestionWithName,
} from '@/types/questionnaire';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Link from 'next/link';
import { useCallback, useEffect, useMemo } from 'react';
import ChoiceItem from './ChoiceItem';
import DosageChoiceItem from './DosageChoiceItem';

interface SingleChoiceProps {
  question: QuestionWithName;
  answer: CodedAnswer[];
  questionnaire: Questionnaire;
  nextPage: (nextPage?: string) => void;
}

const SingleChoice = ({
  questionnaire,
  question,
  answer,
  nextPage,
}: SingleChoiceProps) => {
  const { submitAnswer } = useAnswerAsync(questionnaire);
  const { submitSingleSelectAnswer } = useAnswerAction({
    name: question.name,
    header: question.header,
    questionnaire: questionnaire.name,
    canvas_linkId: question.canvas_linkId,
    codingSystem: question.codingSystem || questionnaire.codingSystem,
    answerOptions: question.answerOptions,
  });

  const handleAnswer = (item: QuestionnaireQuestionAnswerOptions) => {
    const answer = submitSingleSelectAnswer(item);
    nextPage(item.next);
    submitAnswer(answer);
  };

  return question.name === 'WEIGHT_L_POST_Q20' &&
    question?.answerOptions?.length === 1 ? null : (
    <Stack direction="column" gap="45px">
      <List
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '0',
        }}
      >
        {question?.name === 'WEIGHT_L_C_REFILL_Q3'
          ? question.answerOptions!.map(a => (
              <DosageChoiceItem
                key={a.code}
                item={a}
                handleItem={handleAnswer}
                answer={answer}
              />
            ))
          : question.answerOptions!.map(a => (
              <ChoiceItem
                key={a.code}
                item={a}
                handleItem={handleAnswer}
                answer={answer}
              />
            ))}
        {question.name === 'BMS_Q1' || question.name === 'BMS_Q2' ? (
          <Link
            href={`/questionnaires-v2/bipolar-and-mania-screener/BMS_Q4`}
            style={{ alignSelf: 'center', color: '#777' }}
          >
            What is bipolar disorder?
          </Link>
        ) : null}
      </List>
    </Stack>
  );
};

export default SingleChoice;
