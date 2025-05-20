import {
  useAppDispatchContext,
  useAppStateContext,
} from '@/context/AppContext';
import { getAnswerActions } from '@/context/AppContext/reducers/answer/actions';
import {
  AnswerItem,
  AnswerState,
  CodedAnswer,
} from '@/context/AppContext/reducers/types/answer';
import { MedicalHistoryType } from '@/context/AppContext/reducers/types/patient';
import { Database } from '@/lib/database.types';
import {
  Questionnaire,
  QuestionnaireQuestionAnswerOptions,
} from '@/types/questionnaire';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useCallback, useMemo } from 'react';
import { usePatient } from './data';
import { useVisitState } from './useVisit';
import { useApi } from '@/context/ApiContext';
import { Endpoints } from '@/types/endpoints';
import { SubmitAnswersParams } from '@/types/api/submit-answers';
import {
  isBirthControlCandidate,
  isEDCandidate,
  isEnclomipheneCandidate,
  isSleepCandidate,
} from '@/utils/eligibilityChecks';
import { updateEligibilityFlags } from '@/utils/updateEligibilityFlag';

const isNoneOfTheAbove = (text: string) => {
  return [
    'none of the above',
    'other',
    'any of the above',
    'none of these',
    'none, i just want thicker hair',
    'i’m not sure, i’ll submit a photo',
    'i’m not sure',
    'Ninguna de las anteriores',
  ].some(str => text.toLowerCase().includes(str));
};

export const useAnswerActions = () => {
  const dispatch = useAppDispatchContext();
  const dispatchBoundActions = useMemo(
    () => getAnswerActions(dispatch),
    [dispatch]
  );

  return dispatchBoundActions;
};

type PartialQuestion = {
  questionnaire: string;
  name: string;
  header: string;
  canvas_linkId?: string;
  codingSystem?: string;
  answerOptions?: QuestionnaireQuestionAnswerOptions[];
};

export const useAnswerAction = ({
  name,
  questionnaire,
  header,
  canvas_linkId,
  codingSystem,
  answerOptions,
}: PartialQuestion) => {
  const currentAnswer = useAnswerSelect(answers => answers[name]?.answer);
  const { submitAnswer } = useAnswerActions();

  const submitSingleSelectAnswer = useCallback(
    (answer: QuestionnaireQuestionAnswerOptions) => {
      const payload = {
        questionnaire,
        name,
        linkId: canvas_linkId,
        codingSystem,
        text: header,
        answer: [
          {
            valueCoding: {
              display: answer.text,
              code: answer.code!,
              next: answer.next,
              system: answer.system || codingSystem,
            },
          },
        ],
        answerOptions,
      };

      submitAnswer(payload);

      return payload;
    },
    [
      canvas_linkId,
      codingSystem,
      header,
      name,
      questionnaire,
      submitAnswer,
      answerOptions,
    ]
  );

  const submitMultiSelectAnswer = useCallback(
    (answer: QuestionnaireQuestionAnswerOptions) => {
      // check if answer exist
      const ans = (currentAnswer as CodedAnswer[])?.find(
        ans => ans?.valueCoding?.code === answer?.code
      );

      let newAnswers: CodedAnswer[] | null = null;
      //if exist - remove
      if (ans) {
        newAnswers = (currentAnswer as CodedAnswer[]).filter(
          ans => ans.valueCoding.code !== answer.code
        );
        // if 'none of the above' exist - clear all other answers
      } else if (isNoneOfTheAbove(answer.text || '')) {
        newAnswers = ((currentAnswer as CodedAnswer[]) || [])
          .filter(ans => ans?.valueCoding?.display === answer?.text)
          .concat({
            valueCoding: {
              display: answer.text,
              code: answer.code!,
              next: answer.next,
              system: answer.system || codingSystem,
            },
          });

        //if does not exist - add and unselect none of the above
      } else {
        newAnswers = ((currentAnswer as CodedAnswer[]) || [])
          .filter(ans => !isNoneOfTheAbove(ans?.valueCoding?.display || ''))
          .concat({
            valueCoding: {
              display: answer.text,
              code: answer.code!,
              next: answer.next,
              system: answer.system || codingSystem,
            },
          });
      }

      return submitAnswer({
        name,
        questionnaire,
        linkId: canvas_linkId,
        text: header,
        codingSystem: codingSystem,
        answer: newAnswers as CodedAnswer[],
        answerOptions,
      });
    },
    [
      canvas_linkId,
      codingSystem,
      currentAnswer,
      header,
      name,
      questionnaire,
      submitAnswer,
      answerOptions,
    ]
  );

  const submitFreeTextAnswer = useCallback(
    (answer: QuestionnaireQuestionAnswerOptions) => {
      const payload = {
        name,
        questionnaire,
        linkId: canvas_linkId,
        text: header,
        answer: [
          {
            valueString: answer.text,
          },
        ],
      };
      submitAnswer(payload);
      return payload;
    },
    [canvas_linkId, header, name, questionnaire, submitAnswer]
  );

  return {
    submitSingleSelectAnswer,
    submitMultiSelectAnswer,
    submitFreeTextAnswer,
  };
};

export const useAnswerState = () => {
  const state = useAppStateContext();

  const answer = useMemo(() => state.answer, [state.answer]);

  return answer;
};

export const useAnswerSelect = <T>(selector: (store: AnswerState) => T) => {
  const answers = useAnswerState();

  return selector(answers);
};

export const useAnswerAsync = ({
  name,
  canvas_id,
  codingSystem,
}: Questionnaire) => {
  const answers = useAnswerState();
  const { data: patient } = usePatient();
  const supabase = useSupabaseClient<Database>();
  const { id: visit_id } = useVisitState();
  const api = useApi();

  const submitAnswer = useCallback(
    async (answer?: AnswerItem) => {
      if (answer) {
        answers[answer.name] = answer;
      }

      const answersArray = Object.values(answers);

      // Create new ordered array
      const orderedAnswers = [];

      // Loop through original order
      for (const ans of answersArray) {
        // If not a text answer (no numeric suffix), it’s a parent
        if (!/_\d+$/.test(ans.name)) {
          orderedAnswers.push(ans);
          // Find related text answers.
          const children = answersArray.filter(child => {
            return (
              /_\d+$/.test(child.name) && child.name.startsWith(ans.name + '_')
            );
          });

          // Sort children by their numeric suffix
          children.sort((a, b) => {
            const suffixA = parseInt(a.name.split('_').pop() || '0', 10);
            const suffixB = parseInt(b.name.split('_').pop() || '0', 10);
            return suffixA - suffixB;
          });
          orderedAnswers.push(...children);
        }
      }

      const result = await api.post(Endpoints.SUBMIT_ANSWERS, {
        visitId: visit_id,
        canvasId: canvas_id,
        questionnaireName: name,
        newAnswers: orderedAnswers.filter(ans => ans.questionnaire === name),
        codingSystem: codingSystem,
      } as SubmitAnswersParams);

      if (patient?.id) {
        await updateEligibilityFlags(supabase, patient.id, name);
      }

      return result;
    },
    [
      answers,
      api,
      canvas_id,
      codingSystem,
      name,
      visit_id,
      supabase,
      patient?.id,
      name,
      updateEligibilityFlags,
    ]
  );

  const submitMedicalHistory = useCallback(
    async (key: keyof MedicalHistoryType, value: string | null) => {
      if (!patient) return;
      await supabase.from('medical_history').upsert({
        patient_id: patient?.id,
        [key]: value,
      });
    },
    [patient, supabase]
  );

  return {
    submitAnswer,
    submitMedicalHistory,
  };
};
