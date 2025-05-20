import Head from 'next/head';
import { ReactElement, useCallback } from 'react';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';
import { useAnswerAction, useAnswerSelect } from '@/components/hooks/useAnswer';
import Option from '@/components/screens/Question/components/ImageChoice/Option';
import { CodedAnswer } from '@/context/AppContext/reducers/types/answer';
import { QuestionnaireQuestionAnswerOptions } from '@/types/questionnaire';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import NavBarLayout from '@/layouts/NavBarLayout';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const question = {
  name: 'HAIR_L_Q1',
  header: 'Where are you experiencing hair loss?',
  type: 'image-choice',
  canvas_linkId: '5dff01ef-3fcb-450f-ab47-90a605396ff3',
  answerOptions: [
    {
      text: 'Along the hairline',
      code: 'HAIR_L_Q1_A1',
      image: '/images/Hair-Loss-Icon-1.png',
    },
    {
      text: 'At the crown',
      code: 'HAIR_L_Q1_A2',
      image: '/images/Hair-Loss-Icon-2.png',
    },
    {
      text: 'All over',
      code: 'HAIR_L_Q1_A3',
      image: '/images/Hair-Loss-Icon-3.png',
    },
  ],
};

const HairLossQuestion1 = () => {
  const isMobile = useIsMobile();
  const answer = useAnswerSelect(answers => answers[question.name])
    ?.answer as CodedAnswer[];

  const { submitSingleSelectAnswer } = useAnswerAction({
    name: question.name,
    header: question.header,
    questionnaire: 'hair-loss',
    canvas_linkId: question.canvas_linkId,
  });

  const handleSubmit = useCallback(
    (answer: QuestionnaireQuestionAnswerOptions) => {
      submitSingleSelectAnswer(answer);
      Router.push(Pathnames.HAIR_LOSS_QUESTION_2);
    },
    [submitSingleSelectAnswer]
  );

  return (
    <>
      <Head>
        <title>Treat Hair Loss with Zealthy</title>
      </Head>
      <Container maxWidth="sm">
        <Stack gap={isMobile ? 4 : 6}>
          <Typography variant="h2">{question.header}</Typography>
          <Stack spacing={2} alignItems="center">
            {question.answerOptions &&
              question.answerOptions.map(option => (
                <Option
                  key={option.code!}
                  option={option}
                  isSelected={answer?.[0]?.valueCoding.code === option.code}
                  onSelect={handleSubmit}
                />
              ))}
          </Stack>
        </Stack>
      </Container>
    </>
  );
};

HairLossQuestion1.getLayout = (page: ReactElement) => {
  return <NavBarLayout>{page}</NavBarLayout>;
};

export default HairLossQuestion1;
