import { envMapping } from '@/questionnaires';
import { Pathnames } from '@/types/pathnames';
import { QuestionnaireName } from '@/types/questionnaire';
import Router, { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useSelector } from './useSelector';
import { useVisitSelect } from './useVisit';
import jsonLogic, { RulesLogic } from 'json-logic-js';
import { usePatient, usePatientOrders } from './data';
import { useVWO } from '@/context/VWOContext';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { useIntakeState } from './useIntake';
import { useAnswerState } from './useAnswer';
import { CodedAnswer } from '@/context/AppContext/reducers/types/answer';

const skipTransition = [
  'weight-loss-refill',
  'weight-loss-compound-refill',
  'weight-loss-compound-quarterly-refill',
];
const skipComplete = ['responses-reviewed'];

export const usePortalQuestionnaireQuestion = () => {
  const {
    query: { name, question_name },
  } = useRouter();
  const questionnaireName = name as QuestionnaireName;
  const questionName = question_name as string;
  const questionnaire = envMapping[questionnaireName];
  const question = questionnaire?.questions?.[questionName];
  const questionnaires = useVisitSelect(visit => visit.questionnaires);
  const { data: patient } = usePatient();
  const { data: patientOrders } = usePatientOrders();
  const coaching = useSelector(store => store.coaching);
  const medications = useVisitSelect(visit => visit.medications);
  const vwoContext = useVWO();
  const { potentialInsurance, specificCare, variant } = useIntakeState();
  const answers = useSelector(store => store.answer);

  const variation5777 =
    specificCare === SpecificCareOption.WEIGHT_LOSS &&
    ![
      PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
      PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
      PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
    ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT) &&
    ['CA', 'MN'].includes(patient?.region || '')
      ? vwoContext.getVariationName('5777', String(patient?.id))
      : '';

  if (!question) {
    throw new Error(`question ${questionName} is not defined`);
  }

  const questionWithName = {
    ...question,
    header: jsonLogic.apply(question.header, {
      recentOrder:
        patientOrders?.[0]?.prescription?.dosage_instructions?.includes(
          '2 mg'
        ) ||
        patientOrders?.[0]?.prescription?.dosage_instructions?.includes(
          '10 mg'
        ),
    }),
    ...(question?.followUp
      ? {
          followUp: {
            ...question?.followUp,
            body: jsonLogic.apply(question?.followUp?.body!, {
              recentOrder:
                patientOrders?.[0]?.prescription?.dosage_instructions?.includes(
                  '2 mg'
                ) ||
                patientOrders?.[0]?.prescription?.dosage_instructions?.includes(
                  '10 mg'
                ),
            }),
          },
        }
      : {}),
    answerOptions: question?.answerOptions
      ? jsonLogic.apply(question?.answerOptions as any, {
          region: patient?.region,
        })
      : null,
    name: questionName,
    questionnaire: questionnaireName,
  };

  const nextPath = useCallback(
    (next?: RulesLogic<{}> | string | null) => {
      if (!medications) return;
      if (next) {
        const nextQ = jsonLogic.apply(next, {
          gender: patient?.profiles.gender,
          variant5777: variation5777,
        });

        Router.push(
          `${Pathnames.PATIENT_PORTAL}${Pathnames.QUESTIONNAIRES}/${questionnaireName}/${nextQ}`
        );
        return;
      }

      if (question.next) {
        const nextQ = jsonLogic.apply(question.next, {
          gender: patient?.profiles.gender,
          variant5777: variation5777,
        });

        Router.push(
          `${Pathnames.PATIENT_PORTAL}${Pathnames.QUESTIONNAIRES}/${questionnaireName}/${nextQ}`
        );
        return;
      }

      if (!questionnaires.length) {
        Router.push(Pathnames.PATIENT_PORTAL);
        return;
      }

      const currentIndex = questionnaires.findIndex(q => q.name === name);
      const nextQuestionnaire = questionnaires[currentIndex + 1];

      if (!nextQuestionnaire && skipComplete.includes(questionnaireName)) {
        Router.push(Pathnames.PATIENT_PORTAL);
        return;
      }

      if (!nextQuestionnaire && medications.length > 0) {
        Router.push(Pathnames.PATIENT_PORTAL_ADD_ON_MEDICATION);
        return;
      }

      if (!nextQuestionnaire && coaching.length > 0) {
        Router.push(Pathnames.PATIENT_PORTAL_ADD_ON_COACH);
        return;
      }

      if (!nextQuestionnaire && questionnaires[0].name === 'phq-9-checkin') {
        Router.push(Pathnames.PATIENT_PORTAL_COMPLETE_CHECKIN);
        return;
      }
      if (!nextQuestionnaire && questionnaires[0].name === 'phq-9-followup') {
        Router.push(Pathnames.PATIENT_PORTAL_SCHEDULE_PSYCHIATRY);
        return;
      }
      if (!nextQuestionnaire && questionnaire.name === 'responses-reviewed') {
        Router.push(Pathnames.PATIENT_PORTAL);
        return;
      }
      if (!nextQuestionnaire) {
        Router.push(Pathnames.PATIENT_PORTAL_ADD_ON_VISIT);
        return;
      }

      if (nextQuestionnaire?.intro) {
        Router.push(
          `${Pathnames.PATIENT_PORTAL}${Pathnames.QUESTIONNAIRES}/${nextQuestionnaire.name}`
        );
      } else {
        Router.push(
          `${Pathnames.PATIENT_PORTAL}${Pathnames.QUESTIONNAIRES}/${nextQuestionnaire.name}/${nextQuestionnaire?.entry}`
        );
      }
    },
    [
      question,
      questionnaire,
      questionnaires,
      medications,
      coaching.length,
      patient,
      questionnaireName,
      name,
      variation5777,
    ]
  );

  return {
    question: questionWithName,
    questionnaire,
    nextPath,
  };
};
