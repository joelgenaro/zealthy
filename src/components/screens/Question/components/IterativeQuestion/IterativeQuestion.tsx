import Container from '@mui/material/Container';
import { Stack } from '@mui/system';
import isEmpty from 'lodash/isEmpty';
import QuestionHeader from '../QuestionHeader/QuestionHeader';
import { useQuestionnaireQuestionTemplate } from './hooks/useQuestionnaireQuestionTemplate';
import { useAnswerAsync, useAnswerSelect } from '@/components/hooks/useAnswer';
import { useCallback, useMemo, useState } from 'react';
import { isCodedAnswer } from '@/utils/isCodedAnswer';
import QuestionFooter from '../QuestionFooter';
import QuestionBody from '../QuestionBody';
import { useLanguage } from '@/components/hooks/data';
import { QuestionWithName, Questionnaire } from '@/types/questionnaire';

interface IterativeQuestionProps {
  question: QuestionWithName;
  questionnaire: Questionnaire;
  onDone: (nextPath?: string) => void;
}

const IterativeQuestion = ({
  question,
  questionnaire,
  onDone,
}: IterativeQuestionProps) => {
  const [error, setError] = useState('');
  const { subQuestion, nextPage } =
    useQuestionnaireQuestionTemplate(questionnaire.name, question, () => {
      onDone(undefined);
    }) || {};

  const answer = useAnswerSelect(answer =>
    subQuestion?.name ? answer[subQuestion.name]?.answer : undefined
  );
  const language = useLanguage();

  const getTranslation = useCallback(
    (obj: any): any => {
      if (typeof obj === 'string') return obj;
      if (!obj) return '';
      if (Array.isArray(obj)) return obj.map(getTranslation);
      if (typeof obj === 'object') {
        return Object.fromEntries(
          Object.entries(obj).map(([key, value]) => [
            key,
            getTranslation(value),
          ])
        );
      }
      return obj[language] || obj['en'] || Object.values(obj)[0] || '';
    },
    [language]
  );

  const translatedQuestion = useMemo(() => {
    const translated = getTranslation(subQuestion);
    if (translated?.answerOptions && !Array.isArray(translated.answerOptions)) {
      translated.answerOptions = [translated.answerOptions];
    }
    return translated;
  }, [subQuestion, getTranslation]);

  const { submitAnswer } = useAnswerAsync(questionnaire);

  const onClick = useCallback(() => {
    if (isEmpty(answer)) {
      setError(
        getTranslation({
          en: 'Please select an answer',
          esp: 'Por favor seleccione una respuesta',
        })
      );
      return;
    }

    submitAnswer();

    let next = undefined;
    if (answer && !isEmpty(answer) && isCodedAnswer(answer)) {
      next = answer.find(an => an?.valueCoding?.next)?.valueCoding?.next;
    }
    if (typeof nextPage === 'function') {
      nextPage(next);
    }
  }, [answer, nextPage, submitAnswer, getTranslation]);

  const questionsToInclude = [
    'Abilify',
    'Adderall',
    'Celexa',
    'Fluoxetine',
    'Escitalopram',
    'Sertraline',
    'Wellbutrin',
    'Buspar',
  ];
  if (
    (question.dependency === 'ASYNC_MH_MQ_Q14' ||
      question.dependency === 'ASYNC_MH_MQ_Q16') &&
    !questionsToInclude.some(med => translatedQuestion?.header?.includes(med))
  ) {
    if (typeof nextPage === 'function') {
      nextPage();
    }
    return null;
  }

  return (
    <Container style={{ maxWidth: '500px' }}>
      <Stack gap={6}>
        <QuestionHeader question={translatedQuestion} />

        <QuestionBody
          question={translatedQuestion || {}}
          questionnaire={questionnaire}
          onClick={onClick}
          answer={answer || []}
          nextPage={nextPage}
        />

        <QuestionFooter
          question={translatedQuestion}
          error={error}
          onClick={onClick}
          nextPage={nextPage}
        />
      </Stack>
    </Container>
  );
};

export default IterativeQuestion;
