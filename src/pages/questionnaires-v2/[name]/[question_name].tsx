import Head from 'next/head';
import Router from 'next/router';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { useAnswerAsync, useAnswerSelect } from '@/components/hooks/useAnswer';
import { useQuestionnaireQuestion } from '@/components/hooks/useQuestionnaireQuestion';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { getAuthProps } from '@/lib/auth';
import { isCodedAnswer } from '@/utils/isCodedAnswer';
import isEmpty from 'lodash/isEmpty';
import { Pathnames } from '@/types/pathnames';
import { useVisitActions } from '@/components/hooks/useVisit';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import { useCoachingActions } from '@/components/hooks/useCoaching';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import PhotoIdentification from '@/components/screens/Question/components/PhotoIdentification';
import IterativeQuestion from '@/components/screens/Question/components/IterativeQuestion';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import WeightLossBillOfRights from '@/components/screens/Question/components/WeightLossBillOfRights';
import BundledCustomPlan from '@/components/screens/Question/components/BundledCustomPlan';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import { useSelector } from '@/components/hooks/useSelector';
import { useWeightLossSubscription } from '@/components/hooks/data';
import DisqualifyGLP1 from '@/components/screens/Question/components/DisqualifyGLP1';
import NonBundledCustomPlan from '@/components/screens/Question/components/NonBundledCustomPlan';
import {
  useLanguage,
  usePatient,
  useVWOVariationName,
} from '@/components/hooks/data';
import { isFreeTextAnswer } from '@/utils/isFreeTextAnswer';
import LanguageButton from '@/components/shared/Button/LanguageButton';
import getConfig from '../../../../config';

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
const DeliveryAddress = dynamic(
  () => import('@/components/screens/Question/components/DeliveryAddress'),
  { ssr: false }
);
const MentalHealthProviderSchedule = dynamic(
  () =>
    import(
      '@/components/screens/Question/components/MentalHealthProviderSchedule'
    ),
  { ssr: false }
);
const PrimaryCareProviderSchedule = dynamic(
  () =>
    import(
      '@/components/screens/Question/components/PrimaryCareProviderSchedule'
    ),
  { ssr: false }
);
const GileadAssistance = dynamic(
  () => import('@/components/screens/Question/components/GileadAssistance'),
  { ssr: false }
);
const SleepTreatment = dynamic(
  () => import('@/components/screens/Question/components/SleepTreatment'),
  { ssr: false }
);
const SleepSelection = dynamic(
  () => import('@/components/screens/Question/components/SleepSelection'),
  { ssr: false }
);
const InsuranceInformation = dynamic(
  () => import('@/components/screens/Question/components/InsuranceInformation'),
  { ssr: false }
);
const IdentityVerification = dynamic(
  () => import('@/components/screens/Question/components/IdentityVerification'),
  { ssr: false }
);
const FreeConsultProviderSchedule = dynamic(
  () =>
    import(
      '@/components/screens/Question/components/FreeConsultProviderSchedule'
    ),
  { ssr: false }
);
const FreeConsultPrecheckout = dynamic(
  () =>
    import('@/components/screens/Question/components/FreeConsultPrecheckout'),
  {
    ssr: false,
  }
);

const allowNotSubmitAnswer = [
  'suicide-disclaimer',
  'message',
  'skin-treatment',
  'add-mental-coaching',
  'add-weight-coaching',
  'mental-health-result',
  'async-mental-health-result',
  'performance-protocol',
  'async-mental-health-treatment',
  'mental-health-schedule',
  'weight-provider-schedule',
  'working-together',
  'async-mental-health-start',
  'iterative',
  'birth-control-options',
  'bundled-plan',
  'hair-loss-message',
  'hair-loss-review',
  'hair-loss-before-after',
  'hair-loss-what-next',
  'female-hair-loss-info',
  'weight-graph',
  'glp1-explanation',
  'compound-sem-explanation',
  'oral-semaglutide-plan',
  'ed-hl-image-question',
  'ed-hl-treatment-select',
  'image',
];

const Question = () => {
  const isMobile = useIsMobile();
  const [error, setError] = useState<string>('');
  const { question, questionnaire, nextPath }: any = useQuestionnaireQuestion();
  const { data: patient } = usePatient();

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  const { addSpecificCare } = useIntakeActions();

  const { resetQuestionnaires } = useVisitActions();
  const { removeCoaching } = useCoachingActions();
  const language = useLanguage();

  const answerAll = useAnswerSelect(answers => answers);
  const answer = answerAll[question.name]?.answer;

  const { submitAnswer } = useAnswerAsync(questionnaire);

  let variationName6775 = useVWOVariationName('Clone_6775');
  let variationName6775_2 = useVWOVariationName('Clone_6775_2');

  const fromTrendingHairLoss = useSelector(
    store => store.intake?.variant === 'trending-card-hair-loss'
  );

  const { data: weightLossSubscription } = useWeightLossSubscription();

  useEffect(() => {
    if (
      questionnaire?.name === 'weight-loss-v2' &&
      weightLossSubscription?.status === 'active'
    ) {
      Router.push(
        `${Pathnames.POST_CHECKOUT_INTAKES}/weight-loss-checkout-success/WEIGHT_LOSS_CHECKOUT_S_Q1`
      );
    }
  }, [questionnaire, weightLossSubscription]);

  useEffect(() => {
    setError('');
  }, [answer]);

  const onClick = useCallback(
    async (nextPage: string | undefined) => {
      if (question.name.includes('SLEEP_DISCLAIMER')) {
        Router.back();
        return;
      }
      if (question.name === 'DISQUALIFY_BMI') {
        resetQuestionnaires();
        removeCoaching(CoachingType.WEIGHT_LOSS);
        addSpecificCare(SpecificCareOption.PRIMARY_CARE);
        Router.push(Pathnames.SCHEDULE_VISIT);
        return;
      }

      if (fromTrendingHairLoss && question?.name === 'TREATMENT_OPTIONS') {
        Router.push('/what-next');
        return;
      }

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
      const followUp = question?.followUp;

      if (
        followUp &&
        isCodedAnswer(answer) &&
        answer.some(a => a.valueCoding.code === followUp!.showIfResponse)
      ) {
        const otherAnswer = answerAll[followUp!.code]?.answer;

        if (
          !otherAnswer ||
          (otherAnswer &&
            isFreeTextAnswer(otherAnswer) &&
            !otherAnswer[0].valueString)
        ) {
          setError('Please answer the question above');
          return;
        }
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
    [
      question.name,
      question.type,
      answer,
      submitAnswer,
      nextPath,
      resetQuestionnaires,
      removeCoaching,
      addSpecificCare,
    ]
  );

  useEffect(() => {
    if (question?.name === 'ASYNC-MHI-Q1') {
      window?.freshpaint?.track('started-amh-flow');
    }
    if (question?.name === 'ENCLOMIPHENE_Q1') {
      window?.freshpaint?.track('started-enclomiphene-flow');
    }
  }, [question]);

  useEffect(() => {
    if (
      patient?.region === 'CA' &&
      question.questionnaire.toLowerCase() === 'enclomiphene'
    ) {
      Router.push(`${Pathnames.ENCLO_UNSUPPORTED_CARE}`);
    }
  }, [question.questionnaire, patient?.region]);

  if (question.type === 'iterative') {
    return (
      <OnboardingLayout>
        <Head>
          <title>{siteName} | Questions</title>
        </Head>
        <IterativeQuestion
          question={question}
          onDone={onClick}
          questionnaire={questionnaire}
        />
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout>
      <Head>
        <title>{siteName} | Questions</title>
      </Head>
      {question.type === 'bundled-plan' ? (
        <BundledCustomPlan question={question} nextPage={onClick} />
      ) : question.type === 'non-bundled-plan' ? (
        <NonBundledCustomPlan question={question} nextPage={nextPath} />
      ) : question.type === 'primary-care-provider-schedule' ? (
        <PrimaryCareProviderSchedule onSelect={nextPath} />
      ) : question.type === 'mental-health-provider-schedule' ? (
        <MentalHealthProviderSchedule onSelect={nextPath} />
      ) : question.type === 'free-consult-provider-schedule' ? (
        <FreeConsultProviderSchedule onSelect={nextPath} />
      ) : question.type === 'delivery-address' ? (
        <DeliveryAddress nextPage={nextPath} />
      ) : question.type === 'photo-identification' ? (
        <PhotoIdentification
          nextPage={nextPath}
          questionnaire={questionnaire}
        />
      ) : question.type === 'weight-loss-bill-of-rights' ? (
        <WeightLossBillOfRights nextPage={nextPath} />
      ) : question.type === 'disqualify-glp1' ? (
        <DisqualifyGLP1 nextPage={nextPath} />
      ) : question.type === 'gilead-assistance' ? (
        <GileadAssistance nextPage={nextPath} />
      ) : question.type === 'insurance-information' ? (
        <InsuranceInformation nextPage={nextPath} />
      ) : question.type === 'sleep-treatment' ? (
        <SleepTreatment nextPage={nextPath} />
      ) : question.type === 'sleep-selection' ? (
        <SleepSelection nextPage={nextPath} />
      ) : question.type === 'identity-verification' ? (
        <IdentityVerification nextPage={nextPath} />
      ) : question.type === 'free-consult-precheckout' ? (
        <FreeConsultPrecheckout nextPage={nextPath} />
      ) : (
        <Container
          maxWidth="sm"
          style={{
            ...(question.styles?.container || {}),
          }}
        >
          <Stack gap={isMobile ? 4 : 6}>
            <QuestionHeader question={question} />

            <QuestionBody
              question={question}
              questionnaire={questionnaire}
              onClick={onClick}
              content={question.content}
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
          {question.name !== 'RESULTS' &&
          (variationName6775.data?.variation_name === 'Variation-1' ||
            variationName6775_2.data?.variation_name === 'Variation-1') ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                paddingTop: '10px',
              }}
            >
              <LanguageButton />
            </div>
          ) : null}
        </Container>
      )}
    </OnboardingLayout>
  );
};

export const getServerSideProps = getAuthProps;

export default Question;
