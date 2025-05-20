import { useLanguage, usePatient } from '@/components/hooks/data';
import { useAnswerAsync, useAnswerSelect } from '@/components/hooks/useAnswer';
import { useCoachingActions } from '@/components/hooks/useCoaching';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import { usePortalQuestionnaireQuestion } from '@/components/hooks/usePortalQuestionnaireQuestion';
import { useVisitActions } from '@/components/hooks/useVisit';
import CompoundWeightLossRefillRecurringTreatment from '@/components/screens/Question/components/CompoundWeightLossRefillRecurringTreatment';
import PrimaryCareProviderSchedule from '@/components/screens/Question/components/PrimaryCareProviderSchedule';
import RecurringIntro from '@/components/screens/Question/components/RecurringIntro';
import RefillResponsesReviewed from '@/components/screens/Question/components/RefillResponsesReviewed';
import RequestCompoundWeightLossRefill from '@/components/screens/Question/components/RequestCompoundWeightLossRefill';
import SubmitWeightLossCheckin from '@/components/screens/Question/components/SubmitWeightLossCheckin';
import WeightLossCheckin from '@/components/screens/Question/components/WeightLossCheckin';
import WeightLossTreatmentBundled from '@/components/screens/WeightLossTreatmentBundled';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import Footer from '@/components/shared/layout/Footer';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import { AnswerState } from '@/context/AppContext/reducers/types/answer';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useVWO } from '@/context/VWOContext';
import { getAuthProps } from '@/lib/auth';
import { CarePersonType } from '@/types/carePersonType';
import { Pathnames } from '@/types/pathnames';
import { isCodedAnswer } from '@/utils/isCodedAnswer';
import { isFreeTextAnswer } from '@/utils/isFreeTextAnswer';
import { Stack } from '@mui/material';
import isEmpty from 'lodash/isEmpty';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Router from 'next/router';
import { memo, useCallback, useEffect, useState } from 'react';

const ScheduleCoach = dynamic(
  () => import('@/components/screens/ScheduleCoach'),
  { ssr: false }
);

const ResponsesReviewed = dynamic(
  () => import('@/components/screens/Question/components/ResponsesReviewed'),
  { ssr: false }
);

const RequestWeightLossRefill = dynamic(
  () =>
    import('@/components/screens/Question/components/RequestWeightLossRefill'),
  { ssr: false }
);

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

const InsuranceInformationCompoundWeightLossRefill = dynamic(
  () =>
    import(
      '@/components/screens/Question/components/InsuranceInformationCompoundWeightLossRefill'
    ),
  { ssr: false }
);

const MentalHealthProviderSchedule = dynamic(
  () =>
    import(
      '@/components/screens/Question/components/MentalHealthProviderSchedule'
    ),
  { ssr: false }
);

const CompoundWeightLossRefillTreatment = dynamic(
  () =>
    import(
      '@/components/screens/Question/components/CompoundWeightLossRefillTreatment'
    ),
  { ssr: false }
);

const allowNotSubmitAnswer = [
  'suicide-disclaimer',
  'message',
  'information',
  'add-mental-coaching',
  'add-weight-coaching',
  'mental-health-result',
  'confirmation',
  'async-what-happens-next',
  'async-what-happens-next-v2',
  'mental-health-zealthy-program',
];

const Question = () => {
  const [error, setError] = useState<string>('');
  const { question, questionnaire, nextPath } =
    usePortalQuestionnaireQuestion();
  const { addSpecificCare } = useIntakeActions();
  const { resetQuestionnaires } = useVisitActions();
  const { removeCoaching } = useCoachingActions();
  const { data: patient } = usePatient();
  const language = useLanguage();
  const answers = useAnswerSelect(answers => answers);

  const answer = useAnswerSelect(
    (answers: AnswerState) => answers[question.name]?.answer
  );
  const vwoClient = useVWO();
  const { submitAnswer } = useAnswerAsync(questionnaire);
  const [variation6465, setVariation6465] = useState<string | undefined>();

  const { specificCare, potentialInsurance, variant } = useIntakeState();

  useEffect(() => {
    setError('');
  }, [answer]);

  const onClick = useCallback(
    async (nextPage: string | undefined) => {
      if (question.name === 'DISQUALIFY_BMI') {
        resetQuestionnaires();
        removeCoaching(CoachingType.WEIGHT_LOSS);
        addSpecificCare(SpecificCareOption.PRIMARY_CARE);
        Router.push(Pathnames.PATIENT_PORTAL_SCHEDULE_VISIT);
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
        const otherAnswer = answers[followUp!.code]?.answer;

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
    [answer, nextPath, question.type, submitAnswer, answers]
  );

  // const activateVariant = async () => {};

  // useEffect(() => {
  //   if (questionnaire.name === 'weight-loss-compound-refill') {
  //     activateVariant();
  //   }
  // }, [questionnaire, patient, vwoClient]);

  const PreloadVideo = ({ videoUrl }: { videoUrl: string }) => {
    if (!videoUrl) return null;

    return <link rel="preload" as="video" href={videoUrl} />;
  };

  const videoUrl =
    'https://api.getzealthy.com/storage/v1/object/public/videos/Dr.%20Jacob%20Joseph%20Video%202%20(1).mp4?t=2025-01-06T23%3A16%3A53.889Z';

  return (
    <PatientPortalNav>
      <Head>
        <title>Zealthy | Questions</title>
        {/* To preload video for faster play time */}
        <PreloadVideo videoUrl={videoUrl} />
      </Head>
      {question.type === 'recurring-intro' ? (
        <RecurringIntro nextPath={nextPath} />
      ) : question.type === 'primary-care-provider-schedule' ? (
        <PrimaryCareProviderSchedule onSelect={nextPath} />
      ) : question.type === 'mental-health-provider-schedule' ? (
        <MentalHealthProviderSchedule onSelect={nextPath} />
      ) : question.type === 'weight-checkin' ? (
        <WeightLossCheckin
          questionnaire={questionnaire}
          question={question}
          onClick={nextPath}
        />
      ) : question.type === 'responses-reviewed' ? (
        <ResponsesReviewed nextPage={nextPath} />
      ) : question.type === 'refill-responses-reviewed' ? (
        <RefillResponsesReviewed nextPage={nextPath} />
      ) : question.type ===
        'insurance-information-compound-weight-loss-refill' ? (
        <InsuranceInformationCompoundWeightLossRefill nextPage={nextPath} />
      ) : question.type ===
        'compound-weight-loss-refill-recurring-treatment' ? (
        <CompoundWeightLossRefillRecurringTreatment nextPage={nextPath} />
      ) : question.type === 'compound-weight-loss-refill-treatment' ? (
        <CompoundWeightLossRefillTreatment
          videoUrl={videoUrl}
          nextPage={nextPath}
        />
      ) : question.type === 'bundle-weight-loss-reorder-treatment' ? (
        <WeightLossTreatmentBundled nextPage={nextPath} />
      ) : question.type === 'submit-weight-loss-checkin' ? (
        <SubmitWeightLossCheckin nextPage={nextPath} />
      ) : question.type === 'submit-weight-loss-refill' ? (
        <RequestWeightLossRefill nextPage={nextPath} />
      ) : question.type === 'submit-compound-weight-loss-refill' ? (
        <RequestCompoundWeightLossRefill nextPage={nextPath} />
      ) : question.type === 'mental-health-coach-schedule' ? (
        <ScheduleCoach
          title={question.header}
          body={question?.subheader}
          listItems={question?.listItems}
          coachType={CarePersonType.MENTAL_HEALTH}
          onSelect={() => Router.push(Pathnames.PATIENT_PORTAL)}
        />
      ) : (
        <CenteredContainer>
          <Stack gap={4}>
            {question.header && <QuestionHeader question={question} />}
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
        </CenteredContainer>
      )}
      ;
      <Footer />
    </PatientPortalNav>
  );
};

export const getServerSideProps = getAuthProps;

export default memo(Question);
