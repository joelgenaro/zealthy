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
import NavBarLayout from '@/layouts/NavBarLayout';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ChoiceItem from '@/components/screens/Question/components/Choice/components/ChoiceItem';
import List from '@mui/material/List';
import QuestionHeader from '@/components/screens/Question/components/QuestionHeader';
import Box from '@mui/material/Box';

const question: QuestionWithName = {
  name: 'PW_Q1',
  header: 'What was your sex assigned at birth?',
  type: 'choice',
  questionnaire: 'pre-workout-pre-signup',
  answerOptions: [
    {
      text: 'Male',
      code: 'PW_Q1_A1',
    },
    {
      text: 'Female',
      code: 'PW_Q1_A2',
    },
  ],
};

const PreWorkoutQuestion1 = () => {
  const answer = useAnswerSelect(answers => answers[question.name])
    ?.answer as CodedAnswer[];

  const { submitSingleSelectAnswer } = useAnswerAction({
    name: question.name,
    header: question.header,
    questionnaire: 'pre-workout-pre-signup',
    canvas_linkId: question.canvas_linkId,
  });

  const handleSubmit = useCallback(
    (answer: QuestionnaireQuestionAnswerOptions) => {
      if (answer.text === 'Female') {
        return Router.push(Pathnames.PRE_WORKOUT_UNSUPPORTED_CARE);
      }
      submitSingleSelectAnswer(answer);
      Router.push(Pathnames.PRE_WORKOUT_QUESTION_2);
    },
    [submitSingleSelectAnswer]
  );

  return (
    <>
      <Head>
        <title>Zealthy Pre-Workout</title>
      </Head>
      <Container maxWidth="sm">
        <Typography sx={{ fontWeight: 'bold', marginBottom: '20px' }}>
          Performance Protocol
        </Typography>
        <QuestionHeader question={question} />
        <Box sx={{ marginBottom: '30px' }} />
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
                handleItem={handleSubmit}
                answer={answer}
              />
            ))}
          </List>
        </Stack>
      </Container>
    </>
  );
};

PreWorkoutQuestion1.getLayout = (page: ReactElement) => {
  return <NavBarLayout>{page}</NavBarLayout>;
};

export default PreWorkoutQuestion1;
