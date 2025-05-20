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
import { Button } from '@mui/material';
import { width } from '@mui/system';

const question: QuestionWithName = {
  name: 'PW_Q0',
  header:
    'Limited Time Offer: Free medical provider review and free shipping! ',
  type: 'message',
  questionnaire: 'pre-workout-pre-signup',
  description:
    'Claim this one-time offer and start getting your Preworkout delivered to your home in discreet packaging. Zealthy’s Blood Flow Support increases lean muscle mass, promotes faster recovery, and more. The active ingredients include Tadalafil (generic Cialis) and Vardenafil (generic Levitra).',
};

const PreWorkoutQuestion0 = () => {
  const { submitSingleSelectAnswer } = useAnswerAction({
    name: question.name,
    header: question.header,
    questionnaire: 'pre-workout-pre-signup',
    canvas_linkId: question.canvas_linkId,
  });

  const handleSubmit = useCallback(() => {
    return Router.push(Pathnames.PRE_WORKOUT_QUESTION_1);
  }, []);

  return (
    <>
      <Head>
        <title>Zealthy Pre-Workout</title>
      </Head>
      <Container maxWidth="sm" sx={{ marginTop: '2rem' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: '100vh',
            textAlign: 'center',
          }}
        >
          <Typography variant="h2">{question.header}</Typography>
          <Typography variant="body1" sx={{ marginTop: '2rem' }}>
            {question.description}
          </Typography>
          <Button
            sx={{ marginTop: '2rem', width: '100%' }}
            onClick={handleSubmit}
          >
            Continue with my offer
          </Button>
        </Box>
      </Container>
    </>
  );
};

PreWorkoutQuestion0.getLayout = (page: ReactElement) => {
  return <NavBarLayout>{page}</NavBarLayout>;
};

export default PreWorkoutQuestion0;
