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
import { useLanguage } from '@/components/hooks/data';

const question: QuestionWithName = {
  name: 'AMH_Q1',
  header: 'When did you first notice these changes to your mental health?',
  type: 'questionnaire-choice',
  questionnaire: 'async-mental-health-pre-signup',
  answerOptions: [
    {
      text: 'The past few months',
      code: 'AMH_Q1_A1',
    },
    {
      text: 'The past year',
      code: 'AMH_Q1_A2',
    },
    {
      text: 'A few years ago',
      code: 'AMH_Q1_A3',
    },
    {
      text: 'Longer than I can remember',
      code: 'AMH_Q1_A4',
    },
    {
      text: "Unsure. It's been on and off",
      code: 'AMH_Q1_A5',
    },
  ],
};

const AmhQuestion1 = () => {
  const isMobile = useIsMobile();
  const language = useLanguage();
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
    if (!answers?.AMH_Q1?.answer?.length) {
      toast.error(
        language === 'esp'
          ? 'Por favor haga una seleccion'
          : 'Please select an option'
      );
      return;
    }
    Router.push(Pathnames.AMH_FEEL_BETTER);
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

AmhQuestion1.getLayout = (page: ReactElement) => {
  return <NavBarLayout>{page}</NavBarLayout>;
};

export default AmhQuestion1;
