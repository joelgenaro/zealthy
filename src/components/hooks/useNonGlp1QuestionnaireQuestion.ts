import { envMapping } from '@/questionnaires';
import { Pathnames } from '@/types/pathnames';
import { QuestionnaireName } from '@/types/questionnaire';
import Router, { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useVisitSelect } from './useVisit';
import jsonLogic, { RulesLogic } from 'json-logic-js';
import { usePatient } from './data';

export const useNonGlp1QuestionnaireQuestion = () => {
  const {
    query: { name, question_name },
  } = useRouter();
  const questionnaireName = name as QuestionnaireName;
  const questionName = question_name as string;
  const questionnaire = envMapping[questionnaireName];
  const question = questionnaire?.questions?.[questionName];
  const questionnaires = useVisitSelect(visit => visit.questionnaires);
  const { data: patient } = usePatient();
  const medications = useVisitSelect(visit => visit.medications);

  const bupropionSelected = medications.some(med =>
    med.name.toLowerCase().includes('bupropion')
  );

  if (!question) {
    throw new Error(`question ${questionName} is not defined`);
  }

  const questionWithName = {
    ...question,
    name: questionName,
    questionnaire: questionnaireName,
  };

  const nextPath = useCallback(
    async (next?: RulesLogic<{}> | string | null) => {
      if (next) {
        const nextQ = jsonLogic.apply(next, {
          gender: patient?.profiles.gender,
          bupropionSelected,
        });

        Router.push(
          `${Pathnames.NON_GLP1_MEDICATIONS}/${questionnaireName}/${nextQ}`
        );
        return;
      }

      if (question.next) {
        const nextQ = jsonLogic.apply(question.next, {
          gender: patient?.profiles.gender,
          bupropionSelected,
        });
        Router.push(
          `${Pathnames.NON_GLP1_MEDICATIONS}/${questionnaireName}/${nextQ}`
        );
        return;
      }

      if (!questionnaires.length) {
        Router.push(Pathnames.PATIENT_PORTAL);
        return;
      }

      const currentIndex = questionnaires.findIndex(q => q.name === name);
      const nextQuestionnaire = questionnaires[currentIndex + 1];

      if (!nextQuestionnaire) {
        return;
      }
    },
    [
      bupropionSelected,
      question.next,
      questionnaires,
      patient?.profiles.gender,
      questionnaireName,
      name,
    ]
  );

  return {
    question: questionWithName,
    questionnaire,
    nextPath,
  };
};
