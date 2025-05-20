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
import ChoiceItem from '@/components/screens/Question/components/Choice/components/ChoiceItem';
import QuestionHeader from '@/components/screens/Question/components/QuestionHeader';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import NavBarLayout from '@/layouts/NavBarLayout';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';

const question: QuestionWithName = {
  name: 'HAIR_L_Q4',
  questionnaire: 'hair-loss',
  header: 'Have you had dandruff symptoms on your scalp?',
  description: 'Common symptoms are itching, burning, redness or flaking.',
  type: 'choice',
  canvas_linkId: '5dff01ef-3fcb-450f-ab47-90a605396ff3',
  answerOptions: [
    {
      text: 'Yes',
      code: 'HAIR_L_Q4_A1',
    },
    {
      text: 'No',
      code: 'HAIR_L_Q4_A2',
    },
  ],
};

const HairLossQuestion4 = () => {
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
      Router.push(Pathnames.HAIR_LOSS_OFFER);
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
          <QuestionHeader question={question} />
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
        </Stack>
      </Container>
    </>
  );
};

HairLossQuestion4.getLayout = (page: ReactElement) => {
  return <NavBarLayout>{page}</NavBarLayout>;
};

export default HairLossQuestion4;
