import Head from 'next/head';
import { ReactElement, useCallback } from 'react';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';
import {
  useAnswerAction,
  useAnswerSelect,
  useAnswerState,
} from '@/components/hooks/useAnswer';
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
import toast from 'react-hot-toast';

const question: QuestionWithName = {
  name: 'AMH_Q3',
  header:
    'Do any of the following factors play a role in how you’ve been feeling lately?',
  type: 'questionnaire-choice',
  questionnaire: 'async-mental-health-pre-signup',
  answerOptions: [
    {
      text: 'Relationship',
      code: 'AMH_Q3_A1',
    },
    {
      text: 'Work stress',
      code: 'AMH_Q3_A2',
    },
    {
      text: 'Being a parent',
      code: 'AMH_Q3_A3',
    },
    {
      text: 'Pregnancy or post partem',
      code: 'AMH_Q3_A4',
    },
    {
      text: 'School stress',
      code: 'AMH_Q3_A5',
    },
    {
      text: 'Social life',
      code: 'AMH_Q3_A6',
    },
    {
      text: 'Physical health',
      code: 'AMH_Q3_A7',
    },
    {
      text: 'Self confidence',
      code: 'AMH_Q3_A8',
    },
    {
      text: 'Something else',
      code: 'AMH_Q3_A9',
    },
  ],
};

const AmhQuestion3 = () => {
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

  const answers = useAnswerState();
  const handleContinue = () => {
    if (!answers?.AMH_Q3?.answer?.length) {
      toast.error('Please select an option');
      return;
    }
    Router.push(Pathnames.AMH_QUESTION_4);
  };

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

AmhQuestion3.getLayout = (page: ReactElement) => {
  return <NavBarLayout>{page}</NavBarLayout>;
};

export default AmhQuestion3;
