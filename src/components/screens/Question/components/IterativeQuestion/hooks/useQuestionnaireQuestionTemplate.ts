import { useSelector } from '@/components/hooks/useSelector';
import { CodedAnswer } from '@/context/AppContext/reducers/types/answer';
import { QuestionnaireName, QuestionWithName } from '@/types/questionnaire';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import Router from 'next/router';
import { replaceAll } from '@/utils/replaceAll';
import jsonLogic from 'json-logic-js';
import { templateMap } from '@/questionnaires/templateMapping';
import { useABZVariationName } from '@/components/hooks/data';

export const useQuestionnaireQuestionTemplate = (
  questionnaire: QuestionnaireName,
  question: QuestionWithName,
  onDone: () => void
) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const questionName = searchParams?.get('q');
  const template = templateMap[question.template!];
  const coaching = useSelector(store => store.coaching);
  const skippedInsurance = useSelector(store => store.patient.insurance_skip);

  const { data: variant6988 } = useABZVariationName('6988');

  const idx = useMemo(() => {
    if (searchParams?.has('idx')) {
      return Number(searchParams?.get('idx'));
    }
    return 0;
  }, [searchParams]);

  const dependencies = useSelector(
    store => store.answer[question.dependency!].answer as CodedAnswer[]
  );

  const currentDependency = useMemo(() => {
    return dependencies[idx].valueCoding;
  }, [dependencies, idx]);
  const recentAnswers = dependencies;
  console.log(recentAnswers, 'recentAnswe');
  const subQuestion = useMemo(() => {
    let name = questionName;

    if (!name) {
      name = template.entry;
    }

    const q = template.questions[name];
    console.log(currentDependency, 'display');
    return {
      ...q,
      input_placeholder: jsonLogic.apply(q.input_placeholder || '', {
        coaching,
        skippedInsurance,
      }),
      answerOptions: q?.answerOptions
        ? jsonLogic.apply(q?.answerOptions as any, {
            recentMed: dependencies.map(d => d.valueCoding.display)[0],
            variant6988: variant6988?.variation_name,
          })
        : null,
      name: `${currentDependency.code}/${name}`,
      header: replaceAll(
        q.header,
        ['[medication name]', '[Diagnosis]'],
        [currentDependency.display || '', currentDependency.display || '']
      ),
      questionnaire,
    };
  }, [
    coaching,
    currentDependency.code,
    currentDependency.display,
    questionName,
    questionnaire,
    skippedInsurance,
    template.entry,
    template.questions,
    recentAnswers,
  ]);

  const nextPage = useCallback(
    (nextPath?: string) => {
      if (nextPath) {
        Router.push(`${pathname}?q=${nextPath}&idx=${idx}`);
        return;
      }

      //first we need to go through all questions in template
      if (subQuestion.next) {
        Router.push(`${pathname}?q=${subQuestion.next}&idx=${idx}`);
        return;
      }

      if (dependencies[idx + 1]) {
        Router.push(`${pathname}?idx=${idx + 1}`);
        return;
      }

      onDone();
      return;
    },

    [dependencies, idx, onDone, pathname, subQuestion.next]
  );

  return {
    subQuestion,
    template,
    nextPage,
  };
};
