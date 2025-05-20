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
  name: 'PW_Q5',
  header: 'What can Zealthy help you with today?',
  type: 'questionnaire-choice',
  questionnaire: 'pre-workout-pre-signup',
  answerOptions: [
    {
      text: 'Stronger erections',
      code: 'PW_Q5_A1',
    },
    {
      text: 'More sexual satisfaction',
      code: 'PW_Q5_A2',
    },
    {
      text: 'Less muscular fatigue; better pumps',
      code: 'PW_Q5_A3',
    },
    {
      text: 'Improved memory, attention, and cognition',
      code: 'PW_Q5_A4',
    },
  ],
};

const PreWorkoutQuestion5 = () => {
  const isMobile = useIsMobile();
  const answer = useAnswerSelect(answers => answers[question.name])
    ?.answer as CodedAnswer[];

  const { submitMultiSelectAnswer } = useAnswerAction({
    name: question.name,
    header: question.header,
    questionnaire: 'pre-workout-pre-signup',
  });

  const handleAnswer = useCallback(
    (answer: QuestionnaireQuestionAnswerOptions) => {
      submitMultiSelectAnswer(answer);
    },
    [submitMultiSelectAnswer]
  );

  const answers = useAnswerState();

  const handleContinue = () => {
    if (!answers?.PW_Q5?.answer?.length) {
      toast.error('Please select an option');
      return;
    }
    Router.push(`${Pathnames.SIGN_UP}?care=Preworkout`);
  };

  return (
    <>
      <Head>
        <title>Zealthy Pre-Workout</title>
      </Head>
      <Container maxWidth="sm">
        <Stack gap={isMobile ? 4 : 6}>
          <Stack gap="20px">
            <Typography sx={{ fontWeight: 'bold' }}>
              Performance Protocol
            </Typography>
            <Typography variant="h2">{question.header}</Typography>
            <Typography variant="h6">
              Review the following and select all that apply to you.
            </Typography>
          </Stack>
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

PreWorkoutQuestion5.getLayout = (page: ReactElement) => {
  return <NavBarLayout>{page}</NavBarLayout>;
};

export default PreWorkoutQuestion5;
