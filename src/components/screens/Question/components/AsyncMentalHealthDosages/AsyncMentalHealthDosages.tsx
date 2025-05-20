import {
  QuestionWithName,
  QuestionnaireQuestionAnswerOptions,
  Questionnaire,
} from '@/types/questionnaire';
import { List } from '@mui/material';
import { Stack } from '@mui/system';
import { useCallback } from 'react';
import ChoiceItem from '../Choice/components/ChoiceItem';
import { useAnswerAction, useAnswerAsync } from '@/components/hooks/useAnswer';
import { CodedAnswer } from '@/context/AppContext/reducers/types/answer';
import { AMH_Medication_Dosages as answerOptions } from '@/constants/amh-mapping/amh-mapping';

interface OptionsProps {
  question: QuestionWithName;
  answer: CodedAnswer[];
  questionnaire: Questionnaire;
  nextPage: (nextPage?: string) => void;
}

const AsyncMentalHealthDosages = ({
  question,
  answer,
  questionnaire,
  nextPage,
}: OptionsProps) => {
  const { submitAnswer } = useAnswerAsync(questionnaire);

  const currMed = Object.keys(answerOptions).find(
    med => question.header.toLowerCase().includes(med.toLowerCase())!
  );

  const { submitSingleSelectAnswer } = useAnswerAction({
    name: question.name,
    header: question.header,
    questionnaire: question.questionnaire,
    answerOptions: question.answerOptions,
  });
  const handleAnswer = useCallback(
    (item: QuestionnaireQuestionAnswerOptions) => {
      const answer = submitSingleSelectAnswer(item);
      nextPage(item.next);
      submitAnswer(answer);
    },
    [question.type, submitSingleSelectAnswer]
  );

  return (
    <>
      <Stack direction="column" gap="45px">
        <List
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            padding: '0',
          }}
        >
          {answerOptions[currMed as keyof typeof answerOptions]
            ? answerOptions[currMed as keyof typeof answerOptions].map(
                (a, i) => (
                  <ChoiceItem
                    key={i}
                    item={a as QuestionnaireQuestionAnswerOptions}
                    handleItem={handleAnswer}
                    answer={answer}
                  />
                )
              )
            : null}
        </List>
      </Stack>
    </>
  );
};
export default AsyncMentalHealthDosages;
