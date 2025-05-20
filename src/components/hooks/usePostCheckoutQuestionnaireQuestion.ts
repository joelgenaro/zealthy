import { envMapping } from '@/questionnaires';
import { Pathnames } from '@/types/pathnames';
import { QuestionnaireName } from '@/types/questionnaire';
import Router, { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useVisitAsync, useVisitSelect } from './useVisit';
import jsonLogic, { RulesLogic } from 'json-logic-js';
import {
  Appointment,
  useABZVariationName,
  useLanguage,
  useLiveVisitAvailability,
  usePatient,
  usePatientAppointments,
} from './data';
import { useSelector } from './useSelector';
import { postCheckoutEvent } from '@/utils/freshpaint/events';
import { useIntakeState } from './useIntake';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { CodedAnswer } from '@/context/AppContext/reducers/types/answer';
import { useVWO } from '@/context/VWOContext';
import { useVWOVariationName } from './data';
import { usePatientActions } from './usePatient';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useAnswerAsync } from './useAnswer';

export const usePostCheckoutQuestionnaireQuestion = () => {
  const {
    query: { name, question_name },
  } = useRouter();
  const { specificCare, variant } = useIntakeState();
  const { potentialInsurance } = useIntakeState();
  const { data: available } = useLiveVisitAvailability(
    (name === 'identity-verification' && question_name === 'IDENTITY-V-Q1') ||
      name === 'vouched-verification'
  );
  const { data: patientAppointments } = usePatientAppointments();
  const { updatePatient } = usePatientActions();
  const supabase = useSupabaseClient();
  const questionnaireName = name as QuestionnaireName;
  const questionName = question_name as string;
  const questionnaire = envMapping[questionnaireName];
  const language = useLanguage();
  const { submitAnswer } = useAnswerAsync(questionnaire!);
  const { data: variation9143 } = useVWOVariationName('9143');
  const { data: variationName8205 } = useVWOVariationName('8205');
  const variant9143: string | null | undefined = variation9143?.variation_name;
  const spanish = language === 'esp';
  const [questionHistory, setQuestionHistory] = useState<string[]>([]);

  let question: any;

  if (questionnaire?.languages && language === 'esp') {
    question = questionnaire?.languages?.esp.questions?.[questionName];
  } else if (questionnaire?.languages && language !== 'esp') {
    question = questionnaire?.languages?.en.questions?.[questionName];
  } else if (questionnaire?.languages && !language) {
    question = questionnaire?.languages?.en.questions?.[questionName];
  } else {
    question = questionnaire?.questions?.[questionName];
  }

  const questionnaires = useVisitSelect(visit => visit.intakes);
  const { data: patient } = usePatient();
  const answers = useSelector(store => store.answer);
  const { updateIntakeQuestionnaires } = useVisitAsync();
  const vwoContext = useVWO();
  const isBundled = [
    PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
    PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
  ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT);

  useEffect(() => {
    if (questionName) {
      setQuestionHistory(prev => {
        if (!prev.includes(questionName)) {
          return [...prev, questionName];
        }
        return prev;
      });
    }
  }, [questionName]);

  if (!question) {
    throw new Error(`question ${questionName} is not defined`);
  }

  useEffect(() => {
    postCheckoutEvent(question_name as string);
  }, [question_name]);

  const { data: variation5871 } = useVWOVariationName('5871_new');
  const { data: variant6988 } = useABZVariationName('6988');
  const variant6471 = variant === '6471';

  const variant6337 =
    patient &&
    ['KY', 'WI', 'FL']?.includes(patient?.region!) &&
    specificCare === SpecificCareOption.WEIGHT_LOSS &&
    ![
      PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
      PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
      PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
    ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
      ? vwoContext.getVariationName('6337', String(patient?.id))
      : '';

  const medicationQuestion =
    name === 'weight-loss-post'
      ? 'WEIGHT_L_POST_Q4'
      : name === 'weight-loss-post-v2'
      ? 'WEIGHT_L_POST_Q13'
      : name === 'weight-loss-post-bundled'
      ? 'WEIGHT_L_POST_Q12'
      : '';

  const correctHeader = useMemo(() => {
    if (!question.header) return null;

    return question.header;
  }, [question.header]);

  const correctListItems = useMemo(() => {
    if (!question.listItems) return null;
    return question.listItems as any;
  }, [question.listItems]);

  const questionWithName = {
    ...question,
    header: jsonLogic.apply(correctHeader, {
      status: patient?.status,
      specificCare,
      variant6337,
      variant9143,
    }),
    listItems: question?.listItems
      ? jsonLogic.apply(correctListItems, {
          variant6337,
          variant9143,
        })
      : null,
    name: questionName,
    description: jsonLogic.apply(question.description, { specificCare }),
    questionnaire: questionnaireName,
    answerOptions: question?.answerOptions
      ? jsonLogic.apply(question?.answerOptions as any, {
          medications: (
            answers[medicationQuestion]?.answer as CodedAnswer[]
          )?.map((a: CodedAnswer) => {
            return {
              text: a?.valueCoding?.display,
              code: a?.valueCoding?.code,
            };
          }),
          region: patient?.region,
        })
      : null,
  };

  const handleNextQuestionnaire = useCallback(
    (nextQuestionnaireName: QuestionnaireName) => {
      const nextQuestionnaire = envMapping[nextQuestionnaireName];
      if (!nextQuestionnaire) {
        Router.replace(Pathnames.POST_CHECKOUT_COMPLETE_VISIT);
        return;
      }

      if (nextQuestionnaire.intro) {
        Router.push(
          `${Pathnames.POST_CHECKOUT_INTAKES}/${nextQuestionnaire.name}`
        );
      } else {
        const nextQ = jsonLogic.apply(nextQuestionnaire?.entry, {
          gender: patient?.profiles.gender,
          answers,
          skipInsurance: !!patient?.insurance_skip,
          region: patient?.region,
          specificCare,
          variant6337,
          variant6988: variant6988?.variation_name,
          variant6471,
        });

        Router.push(
          `${Pathnames.POST_CHECKOUT_INTAKES}/${nextQuestionnaire.name}/${nextQ}`
        );
      }

      return;
    },
    [
      answers,
      patient?.insurance_skip,
      patient?.profiles.gender,
      patient?.region,
      specificCare,
      variant6471,
    ]
  );

  const nextPath = useCallback(
    async (next?: RulesLogic<{}> | string | null) => {
      if (
        questionName === 'V_IDENTITY_Q3' &&
        questionnaireName === 'vouched-verification' &&
        specificCare === SpecificCareOption.ENCLOMIPHENE &&
        variationName8205?.variation_name === 'Variation-3'
      ) {
        Router.push(
          `/post-checkout/questionnaires-v2/${
            QuestionnaireName.CHECKOUT_SUCCESS
          }/${envMapping[QuestionnaireName.CHECKOUT_SUCCESS]!.entry}`
        );
        return;
      }

      if (
        questionName === 'CHECKOUT_S_Q1' &&
        questionnaireName === 'checkout-success' &&
        specificCare === SpecificCareOption.ENCLOMIPHENE &&
        variationName8205?.variation_name === 'Variation-3'
      ) {
        Router.push(
          `/post-checkout/questionnaires-v2/${
            QuestionnaireName.ASYNC_WHAT_HAPPENS_NEXT_V2
          }/${envMapping[QuestionnaireName.ASYNC_WHAT_HAPPENS_NEXT_V2]!.entry}`
        );
        return;
      }

      if (
        questionName === 'ASYNC-WIN-Q1' &&
        questionnaireName === 'async-what-happens-next-v2' &&
        specificCare === SpecificCareOption.ENCLOMIPHENE &&
        variationName8205?.variation_name === 'Variation-3'
      ) {
        console.log(
          'Enclomiphene Variation-4: Async What Happens Next completed, routing to complete visit'
        );

        Router.push(Pathnames.POST_CHECKOUT_COMPLETE_VISIT);
        return;
      }

      if (
        questionName === 'WEIGHT_L_POST_Q15' &&
        questionnaireName === 'weight-loss-post-v2'
      ) {
        Router.push(
          `/post-checkout/questionnaires-v2/weight-loss-preference/WEIGHT-LOSS-PREFERENCE-A-Q1`
        );
        return;
      }

      if (
        questionName === 'WEIGHT-LOSS-PREFERENCE-A-Q1' &&
        questionnaireName !== 'weight-loss-post-bundled' &&
        questionnaireName !== 'weight-loss-bundled'
      ) {
        Router.push(
          `/post-checkout/questionnaires-v2/weight-loss-pay/WEIGHT-LOSS-PAY-A-Q1`
        );
        return;
      }

      if (
        questionName === 'WEIGHT-LOSS-PAY-A-Q1' &&
        questionnaireName === 'weight-loss-post-v2'
      ) {
        Router.push(
          `/post-checkout/questionnaires-v2/weight-loss-treatment/WEIGHT-LOSS-TREATMENT-A-Q1`
        );
        return;
      }

      if (next) {
        const nextQ = jsonLogic.apply(next, {
          gender: patient?.profiles.gender,
          answers,
          skipInsurance: !!patient?.insurance_skip,
          region: patient?.region,
          specificCare,
          variant,
          variant6337,
          variant6988: variant6988?.variation_name,
          variant6471,
        });

        if (nextQ) {
          Router.push(
            `${Pathnames.POST_CHECKOUT_INTAKES}/${questionnaireName}/${nextQ}`
          );
          return;
        }
      }

      if (question?.next) {
        const nextQ = jsonLogic.apply(question?.next, {
          gender: patient?.profiles.gender,
          answers,
          specificCare,
          skipInsurance: !!patient?.insurance_skip,
          region: patient?.region,
          variant,
          variant6337,
          variant6988: variant6988?.variation_name,
          variant6471,
        });

        if (
          nextQ === 'WEIGHT_L_POST_Q14' &&
          questionnaireName === 'weight-loss-post-v2'
        ) {
          Router.push(
            `${Pathnames.POST_CHECKOUT_INTAKES}/${questionnaireName}/WEIGHT_L_POST_Q15`
          );
          return;
        }

        if (nextQ) {
          if (
            questionnaireName === 'weight-loss-post-v2' &&
            nextQ === 'WEIGHT_L_POST_Q20' &&
            questionName === 'WEIGHT_L_POST_Q13' &&
            answers['WEIGHT_L_POST_Q13'].answer.length === 1
          ) {
            const answer = answers['WEIGHT_L_POST_Q13'].answer[0];
            const questionToSkip =
              questionnaire?.languages?.en.questions[nextQ];

            const payload = {
              questionnaire: questionnaire?.name!,
              name: nextQ,
              text: questionToSkip?.header!,
              answer: [
                {
                  valueCoding: {
                    display: answer.valueCoding.display!,
                    code: answer.valueCoding.code!,
                    next: 'GLP_1_MEDICATIONS_DETAILS',
                  },
                },
              ],
            };

            await submitAnswer(payload);
            Router.push(
              `${Pathnames.POST_CHECKOUT_INTAKES}/${questionnaireName}/GLP_1_MEDICATIONS_DETAILS`
            );
            return;
          }

          if (
            question.next === 'WEIGHT_L_POST_Q16' &&
            questionnaireName === 'weight-loss-post-v2'
          ) {
            Router.push(
              `${Pathnames.POST_CHECKOUT_INTAKES}/${questionnaireName}/WEIGHT_L_POST_Q13`
            );
            return;
          }

          if (
            question.next === 'WEIGHT_L_POST_Q14' &&
            questionnaireName === 'weight-loss-post-v2'
          ) {
            Router.push(
              `${Pathnames.POST_CHECKOUT_INTAKES}/${questionnaireName}/WEIGHT_L_POST_Q15`
            );
            return;
          }

          if (
            question.next === 'WEIGHT_L_POST_Q11' &&
            questionnaireName === 'weight-loss-post-v2'
          ) {
            Router.push(
              `/post-checkout/questionnaires-v2/weight-loss-preference/WEIGHT-LOSS-PREFERENCE-A-Q1`
            );
            return;
          }

          Router.push(
            `${Pathnames.POST_CHECKOUT_INTAKES}/${questionnaireName}/${nextQ}`
          );
          return;
        }
      }

      const currentIndex = questionnaires.findIndex(q => q.name === name);
      let nextQuestionnaire = questionnaires[currentIndex + 1];

      if (
        [
          'WEIGHT_LOSS_CHECKOUT_S_Q1',
          'LAB-OR-BLOOD-TESTS-A-Q1',
          'WEIGHT_LOSS_BOR-Q1',
        ].includes(nextQuestionnaire?.entry ?? '') &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        !potentialInsurance
      ) {
        function updateHasInsurance() {
          updatePatient({
            insurance_skip: true,
          });
        }
        window.freshpaint?.track('no-insurance');
        await supabase
          .from('patient')
          .update({ insurance_skip: true })
          .eq('id', patient?.id)
          .then(updateHasInsurance);
      }

      if (
        variation5871?.variation_name === 'Variation-1' &&
        (nextQuestionnaire.name === 'identity-verification' ||
          nextQuestionnaire.name === 'delivery-address')
      ) {
        nextQuestionnaire = questionnaires[currentIndex + 2];
      }

      const hasCompletedIlv =
        patientAppointments?.filter((appointment: Appointment) => {
          return (
            appointment.encounter_type === 'Walked-in' &&
            appointment.status === 'Completed'
          );
        })?.length! > 0;
      if (
        nextQuestionnaire?.name === 'live-provider-visit' &&
        (!available?.available || hasCompletedIlv)
      ) {
        nextQuestionnaire = questionnaires[currentIndex + 2];
      }

      if (!nextQuestionnaire) {
        Router.replace(
          specificCare === SpecificCareOption.WEIGHT_LOSS
            ? Pathnames.PATIENT_PORTAL
            : Pathnames.POST_CHECKOUT_COMPLETE_VISIT
        );
        return;
      }

      return handleNextQuestionnaire(
        nextQuestionnaire.name as QuestionnaireName
      );
    },

    [
      answers,
      available?.available,
      handleNextQuestionnaire,
      isBundled,
      name,
      patient?.id,
      patient?.insurance_skip,
      patient?.profiles.gender,
      patient?.region,
      question?.next,
      questionnaireName,
      questionnaires,
      specificCare,
      vwoContext,
      variant6471,
      patientAppointments,
    ]
  );

  useEffect(() => {
    updateIntakeQuestionnaires(questionnaireName, questionName);
  }, [questionName, questionnaireName, updateIntakeQuestionnaires]);

  return {
    question: questionWithName,
    questionnaire,
    nextPath,
  };
};
