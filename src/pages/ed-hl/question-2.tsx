import Head from 'next/head';
import { ReactElement, useCallback } from 'react';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';
import {
  useAnswerAction,
  useAnswerSelect,
  useAnswerState,
} from '@/components/hooks/useAnswer';
import Button from '@mui/material/Button';
import toast from 'react-hot-toast';

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
  name: 'EDHL_PRESIGNUP_Q2',
  header: 'Do you want to delay your climax to last longer in bed?',
  type: 'choice',
  questionnaire: 'ed-hl-presignup',
  answerOptions: [
    {
      text: 'Yes',
      code: 'EDHL_PRESIGNUP_Q2_A1',
    },
    {
      text: 'Not right now',
      code: 'EDHL_PRESIGNUP_Q2_A2',
    },
  ],
};

const SexPlusHairQuestion2 = () => {
  const isMobile = useIsMobile();
  const answer = useAnswerSelect(answers => answers[question.name])
    ?.answer as CodedAnswer[];
  const { submitSingleSelectAnswer } = useAnswerAction({
    name: question.name,
    header: question.header,
    questionnaire: 'ed-hl-presignup',
  });

  const handleSubmit = useCallback(
    (answer: QuestionnaireQuestionAnswerOptions) => {
      submitSingleSelectAnswer(answer);
    },
    [submitSingleSelectAnswer]
  );

  const answers = useAnswerState();

  const handleContinue = () => {
    if (!answers?.[question.name]?.answer) {
      toast.error('Please select an option');
      return;
    }
    Router.push(Pathnames.EDHL_PRESIGNUP_INFO_1);
  };

  return (
    <>
      <Head>
        <title>Sex + Hair</title>
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
          <Button onClick={handleContinue}>Continue</Button>
        </Stack>
      </Container>
    </>
  );
};

SexPlusHairQuestion2.getLayout = (page: ReactElement) => {
  return <NavBarLayout>{page}</NavBarLayout>;
};

export default SexPlusHairQuestion2;
