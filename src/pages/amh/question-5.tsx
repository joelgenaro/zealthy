import Head from 'next/head';
import { ReactElement, useCallback } from 'react';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';
import { useAnswerAction, useAnswerSelect } from '@/components/hooks/useAnswer';
import { CodedAnswer } from '@/context/AppContext/reducers/types/answer';
import {
  QuestionnaireQuestionAnswerOptions,
  QuestionWithName,
} from '@/types/questionnaire';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import NavBarLayout from '@/layouts/NavBarLayout';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import ChoiceItem from '@/components/screens/Question/components/Choice/components/ChoiceItem';
import List from '@mui/material/List';
import Button from '@mui/material/Button';

const question: QuestionWithName = {
  name: 'AMH_Q5',
  header:
    'How do you feel about taking medication to treat mental health symptoms?',
  type: 'questionnaire-choice',
  questionnaire: 'async-mental-health-pre-signup',
  answerOptions: [
    {
      text: "I'm ready to get started",
      code: 'AMH_Q5_A1',
    },
    {
      text: "I'm open to it but want more information",
      code: 'AMH_Q5_A2',
    },
    {
      text: "I'm unsure about getting started",
      code: 'AMH_Q5_A3',
    },
  ],
};

const AmhQuestion5 = () => {
  const isMobile = useIsMobile();
  const answer = useAnswerSelect(answers => answers[question.name])
    ?.answer as CodedAnswer[];

  const { submitMultiSelectAnswer } = useAnswerAction({
    name: question.name,
    header: question.header,
    questionnaire: 'async-mental-health-pre-signup',
  });

  const handleAnswer = useCallback(
    (answer: QuestionnaireQuestionAnswerOptions) => {
      submitMultiSelectAnswer(answer);
    },
    [submitMultiSelectAnswer]
  );

  const handleContinue = () => {
    Router.push(`${Pathnames.SIGN_UP}?care=Mental+health`);
  };

  console.log(question);
  return (
    <>
      <Head>
        <title>Zealthy Mental Health</title>
      </Head>
      <Container maxWidth="sm">
        <Stack gap={isMobile ? 4 : 6}>
          <Typography variant="h2">{question.header}</Typography>
          <Typography variant="h6">Select all that apply</Typography>
          <Stack direction="column" gap="45px">
            <List
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                padding: '0',
              }}
            >
              {question.answerOptions!.map(a => (
                <ChoiceItem
                  key={a.code}
                  item={a}
                  handleItem={handleAnswer}
                  answer={answer}
                />
              ))}
            </List>
          </Stack>
          <Button onClick={handleContinue}>Continue</Button>
        </Stack>
      </Container>
    </>
  );
};

AmhQuestion5.getLayout = (page: ReactElement) => {
  return <NavBarLayout>{page}</NavBarLayout>;
};

export default AmhQuestion5;
