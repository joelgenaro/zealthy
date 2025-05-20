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
  name: 'AMH_Q2',
  header: 'What brings you here today?',
  type: 'questionnaire-choice',
  questionnaire: 'async-mental-health-pre-signup',
  answerOptions: [
    {
      text: 'Feeling anxious',
      code: 'AMH_Q2_A1',
    },
    {
      text: 'Feeling unusually down',
      code: 'AMH_Q2_A2',
    },
    {
      text: 'Feeling depressed',
      code: 'AMH_Q2_A3',
    },
    {
      text: 'Not feeling social',
      code: 'AMH_Q2_A4',
    },
    {
      text: 'Feeling consistently worried',
      code: 'AMH_Q2_A5',
    },
    {
      text: 'Feeling stressed',
      code: 'AMH_Q2_A6',
    },
    {
      text: 'Feeling burnt out',
      code: 'AMH_Q2_A7',
    },
    {
      text: 'Experiencing panic attacks',
      code: 'AMH_Q2_A8',
    },
    {
      text: 'Not feeling like myself',
      code: 'AMH_Q2_A9',
    },
    {
      text: 'Other',
      code: 'AMH_Q2_A10',
    },
  ],
};

const AmhQuestion2 = () => {
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
    if (!answers?.AMH_Q2?.answer?.length) {
      toast.error('Please select an option');
      return;
    }
    Router.push(Pathnames.AMH_QUESTION_3);
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

AmhQuestion2.getLayout = (page: ReactElement) => {
  return <NavBarLayout>{page}</NavBarLayout>;
};

export default AmhQuestion2;
