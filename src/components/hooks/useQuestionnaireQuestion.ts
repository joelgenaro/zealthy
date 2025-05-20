import { envMapping } from '@/questionnaires';
import { Pathnames } from '@/types/pathnames';
import { Questionnaire, QuestionnaireName } from '@/types/questionnaire';
import Router, { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import { useVisitSelect } from './useVisit';
import { useSelector } from './useSelector';
import jsonLogic, { RulesLogic } from 'json-logic-js';
import { useLanguage, usePatient } from './data';
import { useIntakeState } from './useIntake';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { useVWO } from '@/context/VWOContext';
import { useVWOVariationName } from './data';
import { useParams } from 'next/navigation';
import getConfig from '../../../config';
import { trackWithDeduplication } from '@/utils/freshpaint/utils';

export const useQuestionnaireQuestion = () => {
  const {
    query: { name, question_name },
  } = useRouter();

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  const questionnaireName = name as QuestionnaireName;
  let questionName = question_name as string;
  const language = useLanguage();
  const variationName6775 = useVWOVariationName('Clone_6775');
  const variationName6775_2 = useVWOVariationName('Clone_6775_2');
  const { data: variation7766 } = useVWOVariationName('7766');
  const { data: variation7865_3 } = useVWOVariationName('7865_3');
  const { data: variation8279_6 } = useVWOVariationName('8279_6');
  const params = useParams();

  const isVarOne6775 =
    variationName6775?.data?.variation_name === 'Variation-1';
  const isVarOne6775_2 =
    variationName6775_2?.data?.variation_name === 'Variation-1';

  if (
    questionnaireName === 'sleep' &&
    variation7766?.variation_name === 'Variation-1'
  ) {
    if (!questionName || questionName === 'SLEEP_Q1') {
      questionName = 'SLEEP_Q2';

      if (question_name !== 'SLEEP_Q2') {
        Router.replace(
          `${Pathnames.QUESTIONNAIRES}/${questionnaireName}/SLEEP_Q2`
        );
      }
    }

    if (!questionName || questionName === 'SLEEP_Q7') {
      questionName = 'SLEEP_Q9';

      if (question_name !== 'SLEEP_Q9') {
        Router.replace(
          `${Pathnames.QUESTIONNAIRES}/${questionnaireName}/SLEEP_Q9`
        );
      }
    }
  }

  let questionnaire: Questionnaire | null;

  if (
    language === 'esp' &&
    params &&
    (params.name === 'weight-loss-v2' || params.name === 'weight-loss-esp')
  ) {
    questionnaire = envMapping[QuestionnaireName.WEIGHT_LOSS_SPANISH];
  } else if (
    (isVarOne6775_2 || isVarOne6775) &&
    params?.name === 'weight-loss-esp'
  ) {
    questionnaire = envMapping[QuestionnaireName.WEIGHT_LOSS_V2];
  } else if (
    (isVarOne6775_2 || isVarOne6775) &&
    params?.name !== 'weight-loss-esp'
  ) {
    questionnaire = envMapping[questionnaireName];
  } else {
    questionnaire = envMapping[questionnaireName];
  }

  let question = questionnaire?.questions?.[questionName];

  if (language === 'en' && questionnaire?.languages) {
    question = questionnaire?.languages.en?.questions[questionName];
  } else if (language === 'esp' && questionnaire?.languages) {
    question = questionnaire?.languages.esp?.questions[questionName];
  }

  const { data: patient } = usePatient();
  const answers = useSelector(store => store.answer);
  const questionnaires = useVisitSelect(visit => visit.questionnaires);
  const { potentialInsurance, specificCare, variant } = useIntakeState();
  const BMI = useSelector(store => store.patient.BMI);
  const heart_rate = useSelector(store => store.patient.heart_rate);
  const vwoContext = useVWO();
  const { data: variation5871 } = useVWOVariationName('5871_new');

  useEffect(() => {
    let event: string = '';
    switch (question_name) {
      case 'WEIGHT_L_Q12':
        event = 'weight-loss-heart-rate';
        break;
      case 'WEIGHT-COACHING-Q1A':
        event = 'weight-loss-government-insurance';
        break;
      case 'WEIGHT-COACHING-Q3':
        event = 'weight-loss-program-overview';
        break;
      case 'DISCLAIMER_BLOOD_PRESSURE':
        event = 'skip-blood-pressure';
        break;
      default:
        break;
    }
    if (event) {
      trackWithDeduplication(event);
    }
  }, [question_name]);

  const questionWithName = {
    ...question,
    next: jsonLogic.apply(question?.next ?? '', {
      weightLossFlow: sessionStorage.getItem('weight-loss-flow'),
      gender: patient?.profiles?.gender,
      potentialInsurance,
      siteName,
    }),
    header: jsonLogic.apply(question?.header ?? '', {
      potentialInsurance,
      variant,
      siteName,
    }),
    description: jsonLogic.apply(question?.description ?? '', {
      potentialInsurance,
      siteName,
    }),
    unorderedList: question?.unorderedList
      ? jsonLogic.apply(question.unorderedList as any, {
          potentialInsurance,
        })
      : null,
    listItems: question?.listItems
      ? jsonLogic.apply(question.listItems as any, {
          potentialInsurance,
          region: patient?.region,
          variant,
          language,
          siteName,
        })
      : null,
    name: questionName,
    questionnaire: questionnaireName,
    answerOptions: jsonLogic.apply((question?.answerOptions as any) || '', {
      variant,
      region: patient?.region,
      language,
    }),
  };

  const handleNextQuestionnaire = useCallback(
    (nextQuestionnaireName: QuestionnaireName) => {
      const nextQuestionnaire = envMapping[nextQuestionnaireName];
      if (!nextQuestionnaire) {
        const path =
          specificCare === SpecificCareOption.ASYNC_MENTAL_HEALTH
            ? Pathnames.ASYNC_MENTAL_HEALTH_WHAT_NEXT
            : Pathnames.WHAT_NEXT;
        Router.push(path);
        return;
      }

      if (
        nextQuestionnaire.care &&
        questionnaire?.care &&
        nextQuestionnaire.care !== questionnaire.care
      ) {
        Router.push(
          `${Pathnames.QUESTIONNAIRES}/transition?name=${questionnaire.name}`
        );
        return;
      }

      if (nextQuestionnaire.intro) {
        const skipIntro = jsonLogic.apply(
          nextQuestionnaire.skipIntro || false,
          {
            skipIntro: specificCare === SpecificCareOption.ASYNC_MENTAL_HEALTH,
          }
        );

        if (!skipIntro) {
          return Router.push(
            `${Pathnames.QUESTIONNAIRES}/${nextQuestionnaire.name}`
          );
        }
      }

      const nextQ = jsonLogic.apply(nextQuestionnaire.entry, {
        weightLossFlow: sessionStorage.getItem('weight-loss-flow'),
        potentialInsurance: potentialInsurance,
        gender: patient?.profiles?.gender,
        region: patient?.region,
        language,
        variant,
        siteName,
        variant4022:
          patient?.region !== 'CA' &&
          specificCare === SpecificCareOption.WEIGHT_LOSS
            ? vwoContext.getVariationName('4022', String(patient?.id))
            : '',
        variant4004:
          potentialInsurance === PotentialInsuranceOption.TIRZEPATIDE_BUNDLED
            ? vwoContext.getVariationName('4004', String(patient?.id))
            : '',
        variant5751:
          patient &&
          ['KY']?.includes(patient?.region!) &&
          specificCare === SpecificCareOption.WEIGHT_LOSS &&
          ![
            PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
            PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
            PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
          ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
            ? vwoContext.getVariationName('5751', String(patient?.id))
            : '',
        variation:
          patient?.region === 'CA'
            ? vwoContext.getVariationName('3596', String(patient?.id))
            : '',
        edVariation:
          specificCare === SpecificCareOption.ERECTILE_DYSFUNCTION &&
          potentialInsurance !== PotentialInsuranceOption.ED_HARDIES &&
          ['FL', 'TX', 'IL', 'GA', 'NV', 'VA', 'IN', 'TN', 'AZ']?.includes(
            patient?.region!
          )
            ? vwoContext.getVariationName('5146', String(patient?.id))
            : '',
        edVariationV2:
          specificCare === SpecificCareOption.ERECTILE_DYSFUNCTION &&
          potentialInsurance !== PotentialInsuranceOption.ED_HARDIES &&
          [
            'NJ',
            'OH',
            'WI',
            'LA',
            'MO',
            'PA',
            'AL',
            'OR',
            'NC',
            'CO',
            'WA',
          ]?.includes(patient?.region!)
            ? vwoContext.getVariationName('5146-2', String(patient?.id))
            : '',
        variant6792:
          ['IN', 'NC', 'GA', 'AZ', 'MN', 'TX']?.includes(patient?.region!) &&
          specificCare === SpecificCareOption.WEIGHT_LOSS &&
          ![
            PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
            PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
            PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
          ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
            ? vwoContext.getVariationName('6792', String(patient?.id))
            : '',
        variant5777:
          ['CA', 'MN']?.includes(patient?.region!) &&
          specificCare === SpecificCareOption.WEIGHT_LOSS &&
          ![
            PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
            PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
            PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
          ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
            ? vwoContext.getVariationName('5777', String(patient?.id))
            : '',
        answers,
        variant7743:
          ['IA', 'NV', 'NM']?.includes(patient?.region!) &&
          specificCare === SpecificCareOption.WEIGHT_LOSS &&
          ![
            PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
            PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
            PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
          ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
            ? vwoContext.getVariationName('7743', String(patient?.id))
            : '',
        variant8279_6: variation8279_6?.variation_name,
      });

      return Router.push(
        `${Pathnames.QUESTIONNAIRES}/${nextQuestionnaire.name}/${nextQ}`
      );
    },
    [
      answers,
      potentialInsurance,
      questionnaire?.care,
      questionnaire?.name,
      specificCare,
      variant,
      vwoContext,
      language,
      patient,
    ]
  );

  const nextPath = useCallback(
    (next?: RulesLogic<{}> | string | null) => {
      if (next) {
        const nextQ = jsonLogic.apply(next, {
          weightLossFlow: sessionStorage.getItem('weight-loss-flow'),
          potentialInsurance: potentialInsurance,
          gender: patient?.profiles?.gender,
          region: patient?.region,
          language,
          siteName,
          variant8284: vwoContext.getVariationName('8284', String(patient?.id)),
          variant4022:
            patient?.region !== 'CA' &&
            specificCare === SpecificCareOption.WEIGHT_LOSS
              ? vwoContext.getVariationName('4022', String(patient?.id))
              : '',
          variant4004:
            potentialInsurance === PotentialInsuranceOption.TIRZEPATIDE_BUNDLED
              ? vwoContext.getVariationName('4004', String(patient?.id))
              : '',
          variant5751:
            patient &&
            ['KY']?.includes(patient?.region!) &&
            specificCare === SpecificCareOption.WEIGHT_LOSS &&
            ![
              PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
              PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
              PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
            ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
              ? vwoContext.getVariationName('5751', String(patient?.id))
              : '',
          variation:
            patient?.region === 'CA'
              ? vwoContext.getVariationName('3596', String(patient?.id))
              : '',
          edVariation:
            specificCare === SpecificCareOption.ERECTILE_DYSFUNCTION &&
            potentialInsurance !== PotentialInsuranceOption.ED_HARDIES &&
            ['FL', 'TX', 'IL', 'GA', 'NV', 'VA', 'IN', 'TN', 'AZ']?.includes(
              patient?.region!
            )
              ? vwoContext.getVariationName('5146', String(patient?.id))
              : '',
          edVariationV2:
            specificCare === SpecificCareOption.ERECTILE_DYSFUNCTION &&
            potentialInsurance !== PotentialInsuranceOption.ED_HARDIES &&
            [
              'NJ',
              'OH',
              'WI',
              'LA',
              'MO',
              'PA',
              'AL',
              'OR',
              'NC',
              'CO',
              'WA',
            ]?.includes(patient?.region!)
              ? vwoContext.getVariationName('5146-2', String(patient?.id))
              : '',
          variant5777:
            ['CA', 'MN']?.includes(patient?.region!) &&
            specificCare === SpecificCareOption.WEIGHT_LOSS &&
            ![
              PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
              PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
              PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
            ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
              ? vwoContext.getVariationName('5777', String(patient?.id))
              : '',
          variant6792:
            ['IN', 'NC', 'GA', 'AZ', 'MN', 'TX']?.includes(patient?.region!) &&
            specificCare === SpecificCareOption.WEIGHT_LOSS &&
            ![
              PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
              PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
              PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
            ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
              ? vwoContext.getVariationName('6792', String(patient?.id))
              : '',
          variant7743:
            ['IA', 'NV', 'NM']?.includes(patient?.region!) &&
            specificCare === SpecificCareOption.WEIGHT_LOSS &&
            ![
              PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
              PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
              PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
            ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
              ? vwoContext.getVariationName('7743', String(patient?.id))
              : '',
          variant8279_6: variation8279_6?.variation_name,
          heart_rate,
          answers,
          variant,
          BMI,
        });

        if (nextQ) {
          Router.push(
            `${Pathnames.QUESTIONNAIRES}/${questionnaireName}/${nextQ}`
          );
          return;
        }
      }

      if (question?.next) {
        const nextQ = jsonLogic.apply(question?.next, {
          weightLossFlow: sessionStorage.getItem('weight-loss-flow'),
          potentialInsurance: potentialInsurance,
          gender: patient?.profiles?.gender,
          region: patient?.region,
          language,
          siteName,
          variant4022:
            patient?.region !== 'CA' &&
            specificCare === SpecificCareOption.WEIGHT_LOSS
              ? vwoContext.getVariationName('4022', String(patient?.id))
              : '',
          variant4004:
            potentialInsurance === PotentialInsuranceOption.TIRZEPATIDE_BUNDLED
              ? vwoContext.getVariationName('4004', String(patient?.id))
              : '',
          variant5751:
            patient &&
            ['KY']?.includes(patient?.region!) &&
            specificCare === SpecificCareOption.WEIGHT_LOSS &&
            ![
              PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
              PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
              PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
            ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
              ? vwoContext.getVariationName('5751', String(patient?.id))
              : '',
          variation:
            patient?.region === 'CA'
              ? vwoContext.getVariationName('3596', String(patient?.id))
              : '',
          edVariation:
            specificCare === SpecificCareOption.ERECTILE_DYSFUNCTION &&
            potentialInsurance !== PotentialInsuranceOption.ED_HARDIES &&
            ['FL', 'TX', 'IL', 'GA', 'NV', 'VA', 'IN', 'TN', 'AZ']?.includes(
              patient?.region!
            )
              ? vwoContext.getVariationName('5146', String(patient?.id))
              : '',
          edVariationV2:
            specificCare === SpecificCareOption.ERECTILE_DYSFUNCTION &&
            potentialInsurance !== PotentialInsuranceOption.ED_HARDIES &&
            [
              'NJ',
              'OH',
              'WI',
              'LA',
              'MO',
              'PA',
              'AL',
              'OR',
              'NC',
              'CO',
              'WA',
            ]?.includes(patient?.region!)
              ? vwoContext.getVariationName('5146-2', String(patient?.id))
              : '',
          variant5777:
            ['CA', 'MN']?.includes(patient?.region!) &&
            specificCare === SpecificCareOption.WEIGHT_LOSS &&
            ![
              PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
              PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
              PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
            ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
              ? vwoContext.getVariationName('5777', String(patient?.id))
              : '',
          variant6792:
            ['IN', 'NC', 'GA', 'AZ', 'MN', 'TX']?.includes(patient?.region!) &&
            specificCare === SpecificCareOption.WEIGHT_LOSS &&
            ![
              PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
              PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
              PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
            ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
              ? vwoContext.getVariationName('6792', String(patient?.id))
              : '',
          variant7743:
            ['IA', 'NV', 'NM']?.includes(patient?.region!) &&
            specificCare === SpecificCareOption.WEIGHT_LOSS &&
            ![
              PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
              PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
              PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
            ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
              ? vwoContext.getVariationName('7743', String(patient?.id))
              : '',
          variant8279_6: variation8279_6?.variation_name,
          heart_rate,
          answers,
          variant,
          BMI,
        });

        if (
          variation5871?.variation_name === 'Variation-1' &&
          nextQ === 'DELIVERY-ADDRESS'
        ) {
          return handleNextQuestionnaire(
            QuestionnaireName.VOUCHED_VERIFICATION as QuestionnaireName
          );
        }
        if (
          questionName === 'SLEEP_Q22' &&
          variation7766?.variation_name === 'Variation-1'
        ) {
          return handleNextQuestionnaire(
            QuestionnaireName.VOUCHED_VERIFICATION as QuestionnaireName
          );
        }
        if (nextQ === 'SLEEP_Q11' && patient?.profiles.gender === 'male') {
          return Router.push(
            `${Pathnames.QUESTIONNAIRES}/${questionnaireName}/SLEEP_Q12`
          );
        }

        if (
          nextQ === 'WEIGHT-COACHING-Q1A' &&
          questionnaireName !== 'weight-loss-bundled'
        ) {
          Router.push(
            `${Pathnames.QUESTIONNAIRES}/${questionnaireName}/WEIGHT-COACHING-Q2`
          );
          return;
        }

        if (
          nextQ === 'WEIGHT_L_Q5' &&
          questionnaireName !== 'weight-loss-bundled'
        ) {
          Router.push(
            `${Pathnames.QUESTIONNAIRES}/${questionnaireName}/WEIGHT_L_Q6`
          );
          return;
        }

        if (
          questionName === 'WEIGHT_L_Q6' &&
          questionnaireName !== 'weight-loss-bundled'
        ) {
          Router.push(
            `${Pathnames.QUESTIONNAIRES}/${questionnaireName}/WEIGHT_L_Q8`
          );
          return;
        }

        if (
          nextQ === 'COMPLETED' &&
          (variation7865_3?.variation_name === 'Variation-1' ||
            variation7865_3?.variation_name === 'Variation-2')
        ) {
          Router.push(
            `${Pathnames.QUESTIONNAIRES}/${questionnaireName}/AT_HOME_LAB`
          );
          return;
        }

        if (
          nextQ === 'WEIGHT_L_Q8' &&
          questionnaireName !== 'weight-loss-bundled'
        ) {
          Router.push(
            `${Pathnames.QUESTIONNAIRES}/${questionnaireName}/WEIGHT-COACHING-Q2`
          );
          return;
        }

        if (nextQ) {
          Router.push(
            `${Pathnames.QUESTIONNAIRES}/${questionnaireName}/${nextQ}`
          );
          return;
        }
      }

      const currentIndex = questionnaires.findIndex(q => q.name === name);
      const nextQuestionnaire = questionnaires[currentIndex + 1];

      if (
        (question?.type === 'photo-identification' ||
          question?.type === 'ssn-verification' ||
          question?.type === 'crosscheck-verification') &&
        variation5871?.variation_name === 'Variation-1'
      ) {
        return Router.push(Pathnames.WHAT_NEXT);
      }

      if (!nextQuestionnaire) {
        const path =
          specificCare === SpecificCareOption.ASYNC_MENTAL_HEALTH
            ? Pathnames.ASYNC_MENTAL_HEALTH_WHAT_NEXT
            : Pathnames.WHAT_NEXT;
        Router.push(path);
        return;
      }

      handleNextQuestionnaire(nextQuestionnaire.name as QuestionnaireName);
    },
    [
      question?.next,
      questionnaires,
      handleNextQuestionnaire,
      potentialInsurance,
      patient,
      vwoContext,
      heart_rate,
      answers,
      variant,
      BMI,
      questionnaireName,
      name,
      specificCare,
      language,
    ]
  );

  if (!question) {
    return;
  }

  return {
    question: questionWithName,
    questionnaire,
    nextPath,
  };
};
