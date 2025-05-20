import Head from 'next/head';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { getUnauthProps } from '@/lib/auth';
import { ReactElement, useCallback } from 'react';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import {
  Questionnaire,
  QuestionnaireQuestionAnswerOptions,
  QuestionWithName,
} from '@/types/questionnaire';
import { envMapping } from '@/questionnaires';
import { useAnswerAction } from '@/components/hooks/useAnswer';
import ChoiceItem from '@/components/screens/Question/components/Choice/components/ChoiceItem';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { VARIANT_7759 } from '../ed';

interface SingleChoiceProps {
  question: QuestionWithName;
  questionnaire: Questionnaire;
}

const SingleChoice = ({ questionnaire, question }: SingleChoiceProps) => {
  const { submitSingleSelectAnswer } = useAnswerAction({
    name: question.name,
    header: question.header,
    questionnaire: questionnaire.name,
    canvas_linkId: question.canvas_linkId,
    codingSystem: question.codingSystem || questionnaire.codingSystem,
  });
  const { query, push } = Router;

  const handleAnswer = useCallback(
    (item: QuestionnaireQuestionAnswerOptions) => {
      submitSingleSelectAnswer(item);
      if (query.variant === '5674-ED') {
        push({
          pathname: Pathnames.ED_TRANSITION_3,
          query: {
            care: SpecificCareOption.ERECTILE_DYSFUNCTION,
            ins: PotentialInsuranceOption.ED_HARDIES,
            variant: '5674-ED',
          },
        });
      } else if (query.variant === '5440') {
        push({
          pathname: Pathnames.ED_TRANSITION_3,
          query: {
            care: SpecificCareOption.ERECTILE_DYSFUNCTION,
            variant: '5440',
          },
        });
      } else if (query.variant === VARIANT_7759) {
        push({
          pathname: Pathnames.ED_TRANSITION_3,
          query: {
            variant: VARIANT_7759,
          },
        });
      } else {
        Router.push(Pathnames.ED_TRANSITION_3);
      }
    },
    [push, query.variant, submitSingleSelectAnswer]
  );

  return (
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
            answer={[]}
          />
        ))}
      </List>
    </Stack>
  );
};

const question: QuestionWithName = {
  name: 'ED_Q1',
  questionnaire: 'ed',
  header:
    'How often do you have trouble getting or keeping an erection during sex?',
  type: 'choice',
  canvas_linkId: '6b59f9fe-8f39-4a82-9723-65e5dbf6b3b2',
  answerOptions: [
    {
      text: 'Always',
      code: 'ED_Q1_A1',
    },
    {
      text: 'More than half the time',
      code: 'ED_Q1_A2',
    },
    {
      text: 'Sometimes',
      code: 'ED_Q1_A3',
    },
    {
      text: 'Rarely',
      code: 'ED_Q1_A4',
    },
  ],
};

const edQuestionnaire = envMapping.ed!;

const FrequencyQuestion = () => {
  const isMobile = useIsMobile();

  return (
    <>
      <Head>
        <title>ED Zealthy | Frequency</title>
      </Head>

      <Container maxWidth="sm" sx={{ marginBottom: '12px' }}>
        <Stack gap={isMobile ? 4 : 6}>
          <Typography variant="h2">{question.header}</Typography>
          <SingleChoice question={question} questionnaire={edQuestionnaire} />
        </Stack>
      </Container>
    </>
  );
};

export const getServerSideProps = getUnauthProps;

FrequencyQuestion.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default FrequencyQuestion;
