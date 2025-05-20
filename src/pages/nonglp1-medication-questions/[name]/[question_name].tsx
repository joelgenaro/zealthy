import Head from 'next/head';
import dynamic from 'next/dynamic';
import { Container, Stack } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import { useAnswerAsync, useAnswerSelect } from '@/components/hooks/useAnswer';
import { AnswerState } from '@/context/AppContext/reducers/types/answer';
import { isCodedAnswer } from '@/utils/isCodedAnswer';
import { useNonGlp1QuestionnaireQuestion } from '@/components/hooks/useNonGlp1QuestionnaireQuestion';
import isEmpty from 'lodash/isEmpty';
import { getAuthProps } from '@/lib/auth';
import Footer from '@/components/shared/layout/Footer';
import { useLanguage } from '@/components/hooks/data';

const QuestionHeader = dynamic(
  () => import('@/components/screens/Question/components/QuestionHeader'),
  { ssr: false }
);
const QuestionFooter = dynamic(
  () => import('@/components/screens/Question/components/QuestionFooter'),
  { ssr: false }
);
const QuestionBody = dynamic(
  () => import('@/components/screens/Question/components/QuestionBody'),
  { ssr: false }
);
const allowNotSubmitAnswer = [
  'suicide-disclaimer',
  'message',
  'skin-treatment',
  'add-mental-coaching',
  'add-weight-coaching',
  'mental-health-result',
  'mental-health-schedule',
  'weight-provider-schedule',
];
const Question = () => {
  const [error, setError] = useState<string>('');
  const language = useLanguage();

  const { question, questionnaire, nextPath } =
    useNonGlp1QuestionnaireQuestion();

  const answer = useAnswerSelect(
    (answers: AnswerState) => answers[question.name]?.answer
  );
  const { submitAnswer } = useAnswerAsync(questionnaire);

  useEffect(() => {
    setError('');
  }, [answer]);

  const onClick = useCallback(
    async (nextPage: string | undefined) => {
      if (allowNotSubmitAnswer.includes(question.type)) {
        nextPath(null);
        return;
      }
      let next = null;

      if (isEmpty(answer)) {
        setError(
          language === 'esp'
            ? 'Por favor seleccione una respuesta'
            : 'Please select an answer'
        );
        return;
      }

      submitAnswer();

      if (nextPage) {
        nextPath(nextPage);
        return;
      }

      if (!isEmpty(answer) && isCodedAnswer(answer)) {
        next = answer.find(an => an?.valueCoding.next)?.valueCoding.next;
      }

      nextPath(next);
    },
    [answer, nextPath, question.type, submitAnswer]
  );

  return (
    <PatientPortalNav>
      <Head>
        <title>Zealthy | Questions</title>
      </Head>
      <Container style={{ maxWidth: '500px' }}>
        <Stack gap={6}>
          <QuestionHeader question={question} />
          <QuestionBody
            question={question}
            questionnaire={questionnaire}
            onClick={onClick}
            answer={answer}
            nextPage={nextPath}
          />
          <QuestionFooter
            question={question}
            error={error}
            onClick={onClick}
            nextPage={nextPath}
          />
        </Stack>
      </Container>
      <Footer />
    </PatientPortalNav>
  );
};

export const getServerSideProps = getAuthProps;

export default Question;
