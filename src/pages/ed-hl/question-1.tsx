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
import { useIntakeActions } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';

const question: QuestionWithName = {
  name: 'EDHL_PRESIGNUP_Q1',
  header: 'Which is more important to you?',
  type: 'choice',
  questionnaire: 'ed-hl-presignup',
  answerOptions: [
    {
      text: 'Getting hard when I want',
      code: 'EDHL_PRESIGNUP_Q1_A1',
    },
    {
      text: 'Staying hard long enough for great sex',
      code: 'EDHL_PRESIGNUP_Q1_A2',
    },
    {
      text: 'Both',
      code: 'EDHL_PRESIGNUP_Q1_A3',
    },
  ],
};

const SexPlusHairQuestion1 = () => {
  const isMobile = useIsMobile();
  const answer = useAnswerSelect(answers => answers[question.name])
    ?.answer as CodedAnswer[];
  const { submitSingleSelectAnswer } = useAnswerAction({
    name: question.name,
    header: question.header,
    questionnaire: 'ed-hl-presignup',
  });
  const { addSpecificCare } = useIntakeActions();

  const handleSubmit = useCallback(
    (answer: QuestionnaireQuestionAnswerOptions) => {
      submitSingleSelectAnswer(answer);
      addSpecificCare(SpecificCareOption.SEX_PLUS_HAIR);
    },
    [submitSingleSelectAnswer]
  );

  const answers = useAnswerState();

  const handleContinue = () => {
    if (!answers?.[question.name]?.answer) {
      addSpecificCare(SpecificCareOption.SEX_PLUS_HAIR);
      toast.error('Please select an option');
      return;
    }
    Router.push(Pathnames.EDHL_PRESIGNUP_QUESTION_2);
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

SexPlusHairQuestion1.getLayout = (page: ReactElement) => {
  return <NavBarLayout>{page}</NavBarLayout>;
};

export default SexPlusHairQuestion1;
