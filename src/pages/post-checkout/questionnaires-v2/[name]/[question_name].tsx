import { useAnswerAsync, useAnswerSelect } from '@/components/hooks/useAnswer';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { getAuthProps } from '@/lib/auth';
import { isCodedAnswer } from '@/utils/isCodedAnswer';
import { Container, Stack } from '@mui/material';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { memo, useCallback, useEffect, useState, useMemo } from 'react';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import { CarePersonType } from '@/types/carePersonType';
import { usePostCheckoutQuestionnaireQuestion } from '@/components/hooks/usePostCheckoutQuestionnaireQuestion';
import { isFreeTextAnswer } from '@/utils/isFreeTextAnswer';
import { useVisitActions, useVisitSelect } from '@/components/hooks/useVisit';
import { MedicalHistoryType } from '@/context/AppContext/reducers/types/patient';
import { calculateScore } from '@/components/screens/Question/components/AnxietyDepressionResults/utils/calculateScore';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import PhotoIdentification from '@/components/screens/Question/components/PhotoIdentification';
import WeightLossBillOfRights from '@/components/screens/Question/components/WeightLossBillOfRights';
import IterativeQuestion from '@/components/screens/Question/components/IterativeQuestion';
import { useSelector } from '@/components/hooks/useSelector';
import { Database } from '@/lib/database.types';
import CompleteVisit from '@/components/shared/CompleteVisit';
import DisqualifyGLP1 from '@/components/screens/Question/components/DisqualifyGLP1';
import LiveVisitWithProvider from '@/components/screens/Question/components/LiveVisitWithProvider';
import { useIntakeState } from '@/components/hooks/useIntake';
import { useLanguage, useVWOVariationName } from '@/components/hooks/data';
import LanguageButton from '@/components/shared/Button/LanguageButton';
import getConfig from '../../../../../config';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';

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
const ScheduleCoach = dynamic(
  () => import('@/components/screens/ScheduleCoach'),
  { ssr: false }
);
const DeliveryAddress = dynamic(
  () => import('@/components/screens/Question/components/DeliveryAddress'),
  { ssr: false }
);
const PharmacySelection = dynamic(
  () => import('@/components/screens/Question/components/PharmacySelection'),
  { ssr: false }
);
const IdentityVerification = dynamic(
  () => import('@/components/screens/Question/components/IdentityVerification'),
  { ssr: false }
);
const InsuranceInformation = dynamic(
  () => import('@/components/screens/Question/components/InsuranceInformation'),
  { ssr: false }
);
const LabOrBloodTests = dynamic(
  () => import('@/components/screens/Question/components/LabOrBloodTests'),
  { ssr: false }
);
const ResponsesReviewed = dynamic(
  () => import('@/components/screens/Question/components/ResponsesReviewed'),
  { ssr: false }
);
const NowWhat = dynamic(
  () => import('@/components/screens/Question/components/NowWhat'),
  { ssr: false }
);
const MobileAppDownload = dynamic(
  () => import('@/components/screens/Question/components/MobileAppDownload'),
  { ssr: false }
);
const ZealthyProviderSchedule = dynamic(
  () =>
    import('@/components/screens/Question/components/ZealthyProviderSchedule'),
  { ssr: false }
);
const WeightLossMedical = dynamic(
  () => import('@/components/screens/Question/components/WeightLossMedical'),
  { ssr: false }
);
const WeightLossPreference = dynamic(
  () => import('@/components/screens/Question/components/WeightLossPreference'),
  { ssr: false }
);
const WeightLossPay = dynamic(
  () => import('@/components/screens/Question/components/WeightLossPay'),
  { ssr: false }
);
const WeightLossPriorAuth = dynamic(
  () => import('@/components/screens/Question/components/WeightLossPriorAuth'),
  { ssr: false }
);
const WeightLossTreatment = dynamic(
  () => import('@/components/screens/Question/components/WeightLossTreatment'),
  { ssr: false }
);
const WeightLossTreatmentBundled = dynamic(
  () =>
    import(
      '@/components/screens/Question/components/WeightLossTreatmentBundled'
    ),
  { ssr: false }
);
const ConsultationSelection = dynamic(
  () =>
    import('@/components/screens/Question/components/ConsultationSelection'),
  { ssr: false }
);

const allowNotSubmitAnswer = [
  'suicide-disclaimer',
  'message',
  'amh-message-effect',
  'information',
  'add-mental-coaching',
  'add-weight-coaching',
  'mental-health-result',
  'confirmation',
  'async-what-happens-next',
  'async-what-happens-next-v2',
  'skincare-what-next',
  'mental-health-zealthy-program',
  'MENTAL_C_Q10',
  'skin-treatment',
  'WEIGHT_LOSS_TERMS',
  'iterative',
  'live-provider-visit',
  'ed-hl-treatment-select',
];

interface SessionUserProps {
  patient: Database['public']['Tables']['patient']['Row'];
  profile: Database['public']['Tables']['profiles']['Row'];
}

const Question = ({ patient, profile }: SessionUserProps) => {
  const language = useLanguage();
  const isMobile = useIsMobile();
  const [error, setError] = useState<string>('');
  const questionnaires = useVisitSelect(visit => visit.intakes);
  const questionnairesOrder = useVisitSelect(visit => visit.questionnaires);
  const { question, questionnaire, nextPath } =
    usePostCheckoutQuestionnaireQuestion();
  const answerAll = useAnswerSelect(answers => answers);
  const answer = answerAll[question.name]?.answer;
  const { variant, specificCare, potentialInsurance } = useIntakeState();
  const [hasTrackedEnclomiphene, setHasTrackedEnclomiphene] =
    useState<boolean>(false);
  const [hasTrackedSkincare, setHasTrackedSkincare] = useState<boolean>(false);
  const [hasTrackedPrimaryCare, setHasTrackedPrimaryCare] =
    useState<boolean>(false);
  const [hasVerifiedIdentity, setHasVerifiedIdentity] =
    useState<boolean>(false);
  const [hasTrackedPreworkout, setHasTrackedPreworkout] =
    useState<boolean>(false);
  const coaching = useSelector(store => store.coaching);
  const { addMedication } = useVisitActions();

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  let variationName6775 = useVWOVariationName('Clone_6775');
  let variationName6775_2 = useVWOVariationName('Clone_6775_2');
  const { data: variationName8205 } = useVWOVariationName('8205');
  const phqAnswers = useAnswerSelect(answers =>
    Object.values(answers).filter(a => a.questionnaire === 'phq-9')
  );

  const { submitAnswer, submitMedicalHistory } = useAnswerAsync(questionnaire!);

  const enclomiphene = useSelector(store =>
    store.visit.selectedCare.careSelections.find(
      c => c.reason === 'Enclomiphene'
    )
  );

  const preworkout = useSelector(store =>
    store.visit.selectedCare.careSelections.find(c => c.reason === 'Preworkout')
  );

  const consultation = useSelector(store => store.consultation);
  const skincare = useSelector(
    store => store.intake?.specificCare === 'Skincare'
  );
  const primaryCare = useSelector(
    store => store.intake?.specificCare === 'Primary care'
  );
  const hairLoss = useSelector(
    store => store.intake?.specificCare === 'Hair loss'
  );
  const fromTrendingSkincare = useSelector(
    store => store.intake?.variant === 'trending-card-skincare'
  );
  const fromTrendingHairLoss = useSelector(
    store => store.intake?.variant === 'trending-card-hair-loss'
  );
  const fromProgram = useSelector(
    store => store.intake?.variant === 'program-card'
  );

  const semaglutideBundled3Months =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
      ? coaching?.[0]?.planId === 'price_1PfqlXAO83GerSecpsmBc17r'
      : coaching?.[0]?.planId === 'price_1PfqrmAO83GerSecF9WROtam';

  useEffect(() => {
    setError('');
  }, [answer]);

  useEffect(() => {
    if (question.type === 'skip') {
      nextPath(null);
    }
  }, []);

  useEffect(() => {
    if (
      enclomiphene &&
      question?.name === 'CHECKOUT_S_Q1' &&
      !hasTrackedEnclomiphene
    ) {
      window?.freshpaint?.track('enclomiphene-checkout-page-success', {
        total_charged: consultation[0] ? consultation?.[0]?.price : 0,
        email: profile?.email!,
        first_name: profile?.first_name!,
        last_name: profile?.last_name!,
        state: patient?.region!,
        birth_date: profile?.birth_date!,
        gender: profile?.gender!,
        phone: profile?.phone_number!,
        care_type: variant === '5674-ENCLOM' ? 'Enclomiphene ad' : specificCare,
      });
      setHasTrackedEnclomiphene(true);
    }

    if (skincare && question?.name === 'CHECKOUT_S_Q1' && !hasTrackedSkincare) {
      window?.freshpaint?.track('skincare-checkout-page-success', {
        total_charged: consultation?.[0]?.price,
      });
      setHasTrackedSkincare(true);
    }

    if (
      primaryCare &&
      question?.name === 'CHECKOUT_S_Q1' &&
      !hasTrackedPrimaryCare
    ) {
      window?.freshpaint?.track('primary-care-checkout-page-success', {
        total_charged: consultation?.[0]?.price,
      });
      setHasTrackedPrimaryCare(true);
    }

    if (
      preworkout &&
      question?.name === 'CHECKOUT_S_Q1' &&
      !hasTrackedPreworkout
    ) {
      window?.freshpaint?.track('preworkout-checkout-success');
      setHasTrackedPreworkout(true);
    }
  }, [
    enclomiphene,
    question,
    skincare,
    consultation,
    hasTrackedEnclomiphene,
    hasTrackedSkincare,
    profile,
    preworkout,
    hasTrackedPreworkout,
    patient?.region,
  ]);

  const onClick = useCallback(
    async (nextPage: string | undefined) => {
      if (enclomiphene && question?.name === 'CHECKOUT_S_Q1') {
        Router.push(
          `${Pathnames.POST_CHECKOUT_INTAKES}/async-what-happens-next-v2/ASYNC-WIN-Q1`
        );
        return;
      }

      if (fromProgram && question?.name === 'CHECKOUT_S_Q1') {
        Router.push(
          `${Pathnames.POST_CHECKOUT_INTAKES}/${questionnairesOrder?.[1]?.name}`
        );
        return;
      }

      if (allowNotSubmitAnswer.includes(question.type)) {
        nextPath(null);
        return;
      }

      if (allowNotSubmitAnswer.includes(question.name)) {
        nextPath(null);
        return;
      }

      let next = nextPage;
      let selectAnswer = 'Please answer the question above';
      let selectOption = 'Please select an option';

      if (language === 'esp') {
        selectAnswer = 'Por favor contesta la respuesta';
        selectOption = 'Por favor escoje una opción';
      }

      if (!answer || (Array.isArray(answer) && answer.length === 0)) {
        if (question.type === 'text') {
          setError(selectAnswer);
        } else {
          setError(selectOption);
        }
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

      if (question.type === 'medical-history') {
        if (answer && isFreeTextAnswer(answer)) {
          const value = answer[0].valueString;

          submitMedicalHistory(
            question.subType! as keyof MedicalHistoryType,
            value === question.checkboxText ? null : value
          );
        }
      }
      if (question.name === '44255-8') {
        // if second question of PHQ-9 and current score is below 2, skip rest of PHQ-9 and GAD-7
        const phqScore = calculateScore(phqAnswers);

        if (phqScore < 2) {
          const nextQuestionnaire =
            questionnaires[
              questionnaires.findIndex(q => q.name === 'gad-7') + 1
            ];

          if (nextQuestionnaire) {
            Router.push(
              `${Pathnames.POST_CHECKOUT_INTAKES}/${nextQuestionnaire.name}`
            );
            return;
          }
        }
      }

      if (answer && isCodedAnswer(answer)) {
        next = answer.find(an => an?.valueCoding.next)?.valueCoding.next;
      }

      nextPath(next);
    },
    [
      fromTrendingSkincare,
      question.name,
      question.type,
      question.subType,
      question.checkboxText,
      fromProgram,
      answer,
      submitAnswer,
      nextPath,
      questionnairesOrder,
      submitMedicalHistory,
      phqAnswers,
      questionnaires,
    ]
  );

  const PreloadVideo = ({ videoUrl }: { videoUrl: string }) => {
    if (!videoUrl) return null;
    return <link rel="preload" as="video" href={videoUrl} />;
  };

  const videoUrl =
    'https://api.getzealthy.com/storage/v1/object/public/videos/Dr.%20Jacob%20Joseph%20Video%202%20(1).mp4?t=2025-01-06T23%3A16%3A53.889Z';

  if (question.type === 'iterative') {
    return (
      <OnboardingLayout>
        <Head>
          <title>{siteName} | Questions</title>
        </Head>
        <IterativeQuestion
          question={question}
          onDone={onClick}
          questionnaire={questionnaire!}
        />
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout>
      <Head>
        <title>{siteName} | Questions</title>
        {/* To preload video for faster play time */}
        <PreloadVideo videoUrl={videoUrl} />
      </Head>
      {question.type === 'live-provider-visit' ? (
        <LiveVisitWithProvider question={question} nextPath={nextPath} />
      ) : question.type === 'provider-schedule' ? (
        <ZealthyProviderSchedule onSelect={nextPath} />
      ) : question.type === 'mental-health-coach-schedule' ? (
        <ScheduleCoach
          title={question.header}
          body={question?.subheader}
          listItems={question?.listItems}
          coachType={CarePersonType.MENTAL_HEALTH}
          onSelect={nextPath}
        />
      ) : question.type === 'weight-loss-coach-schedule' ? (
        <ScheduleCoach
          title={question.header}
          coachType={CarePersonType.WEIGHT_LOSS}
          onSelect={nextPath}
        />
      ) : question.type === 'disqualify-glp1' ? (
        <DisqualifyGLP1 nextPage={nextPath} />
      ) : question.type === 'delivery-address' ? (
        <DeliveryAddress nextPage={nextPath} />
      ) : question.type === 'insurance-information' ? (
        <InsuranceInformation nextPage={nextPath} />
      ) : question.type === 'lab-or-blood-tests' ? (
        <LabOrBloodTests nextPage={nextPath} />
      ) : question.type === 'responses-reviewed' ? (
        <ResponsesReviewed nextPage={nextPath} />
      ) : question.type === 'now-what' ? (
        <NowWhat nextPage={nextPath} />
      ) : question.type === 'mobile-download' ? (
        <MobileAppDownload nextPage={nextPath} />
      ) : question.type === 'weight-loss-medical' ? (
        <WeightLossMedical nextPage={nextPath} />
      ) : question.type === 'weight-loss-preference' ? (
        <WeightLossPreference nextPage={nextPath} />
      ) : question.type === 'weight-loss-pay' ? (
        <WeightLossPay nextPage={nextPath} />
      ) : question.type === 'weight-loss-prior-auth' ? (
        <WeightLossPriorAuth nextPage={nextPath} />
      ) : question.type === 'weight-loss-treatment' ? (
        <WeightLossTreatment videoUrl={videoUrl} nextPage={nextPath} />
      ) : question.type === 'weight-loss-bundled-treatment' ? (
        <WeightLossTreatmentBundled nextPage={nextPath} />
      ) : question.type === 'weight-loss-bill-of-rights' ? (
        <WeightLossBillOfRights nextPage={nextPath} />
      ) : question.type === 'pharmacy-select' ? (
        <PharmacySelection nextPage={nextPath} />
      ) : question.type === 'identity-verification' ? (
        <IdentityVerification nextPage={nextPath} />
      ) : question.type === 'consultation-selection' ? (
        <ConsultationSelection nextPage={nextPath} />
      ) : question.type === 'complete-visit' ? (
        <CompleteVisit
          nextPage={nextPath}
          patient={patient}
          profile={profile}
        />
      ) : question.type === 'photo-identification' ? (
        <PhotoIdentification
          nextPage={nextPath}
          questionnaire={questionnaire!}
        />
      ) : (
        <Container style={{ maxWidth: '500px' }}>
          <Stack gap={isMobile ? 4 : 6}>
            {(question.header || question.description) && (
              <QuestionHeader question={question} />
            )}
            {questionnaire ? (
              <QuestionBody
                question={question}
                questionnaire={questionnaire}
                onClick={onClick}
                answer={answer}
                nextPage={nextPath}
              />
            ) : null}
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

export default memo(Question);
