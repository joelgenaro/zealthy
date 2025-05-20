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
import QuestionHeader from '@/components/screens/Question/components/QuestionHeader';
import Box from '@mui/material/Box';

const question: QuestionWithName = {
  name: 'PW_Q3',
  header: 'How would you describe your erectile dysfunction?',
  type: 'choice',
  questionnaire: 'pre-workout-pre-signup',
  answerOptions: [
    {
      text: 'Difficulty achieving erections',
      code: 'PW_Q3_A1',
    },
    {
      text: 'Difficulty maintaining erections',
      code: 'PW_Q3_A2',
    },
    {
      text: 'Both',
      code: 'PW_Q3_A3',
    },
    {
      text: 'Neither',
      code: 'PW_Q3_A4',
    },
  ],
};

const PreWorkoutQuestion3 = () => {
  const isMobile = useIsMobile();
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
      submitSingleSelectAnswer(answer);

      Router.push(Pathnames.PRE_WORKOUT_QUESTION_4);
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
        <Stack direction="column" gap="20px">
          <Typography sx={{ marginTop: '15px' }}>
            Why are we asking this?
          </Typography>
          <Typography>
            Zealthy’s Performance Protocol treatment improves sexual, workout,
            and cognitive performance. You’ll be asked questions related to
            these areas, even if they’re not goals for you.
          </Typography>
        </Stack>
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

PreWorkoutQuestion3.getLayout = (page: ReactElement) => {
  return <NavBarLayout>{page}</NavBarLayout>;
};

export default PreWorkoutQuestion3;
