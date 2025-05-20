import Head from 'next/head';
import Router, { useRouter } from 'next/router';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { getAuthProps } from '@/lib/auth';
import { envMapping } from '@/questionnaires';
import { Questionnaire, QuestionnaireName } from '@/types/questionnaire';
import { useCallback, useEffect, useMemo, useState } from 'react';
import jsonLogic from 'json-logic-js';
import { usePatient, usePatientProfile } from '@/components/hooks/data';
import Loading from '@/components/shared/Loading/Loading';
import { useIntakeState } from '@/components/hooks/useIntake';
import { useAnswerState } from '@/components/hooks/useAnswer';
import QuestionIntro from '@/components/screens/Question/components/QuestionIntro';
import { usePatientSelect } from '@/components/hooks/usePatient';
import { useVWO } from '@/context/VWOContext';
import getConfig from '../../../../config';

const QuestionnairePage = () => {
  const {
    query: { name },
  } = useRouter();

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  const questionnaire = envMapping[(name as QuestionnaireName) || ''];
  const { data: patient } = usePatient();
  const { potentialInsurance, variant } = useIntakeState();
  const BMI = usePatientSelect(patient => patient.BMI);
  const answers = useAnswerState();
  const [intro, setIntro] = useState<Questionnaire['intro'] | null>(null);
  const vwoContext = useVWO();
  const variant7743 = ['IA', 'NV', 'NM']?.includes(patient?.region!)
    ? vwoContext.getVariationName('7743', String(patient?.id))
    : '';

  const { data: profile } = usePatientProfile();

  useEffect(() => {
    if (!profile) return;
    if (!profile.first_name || !profile.last_name) {
      Router.push('/onboarding/complete-profile');
    }
  }, [profile]);

  if (!questionnaire) {
    throw new Error(`questionnaire ${name} is not defined`);
  }

  const nextQ = useMemo(() => {
    const answer = answers['ED_Q1'];

    if (answer) {
      return 'ED_Q2';
    }

    return;
  }, [answers]);

  useEffect(() => {
    if (!questionnaire.intro) {
      if (!patient) return;

      const {
        profiles: { gender },
      } = patient;

      const entry = jsonLogic.apply(questionnaire.entry, {
        gender,
        potentialInsurance,
        entry: nextQ,
        BMI,
        variant,
      });

      Router.push(`${name}/${entry}`);
    } else {
      setIntro(
        jsonLogic.apply(questionnaire.intro, {
          potentialInsurance,
          region: patient?.region,
          variant,
          variant7743,
        })
      );
    }
  }, [
    name,
    patient,
    questionnaire.entry,
    questionnaire.intro,
    nextQ,
    potentialInsurance,
    BMI,
    variant,
  ]);

  const onClick = useCallback(() => {
    if (!patient) return;
    const {
      profiles: { gender },
    } = patient;

    const entry = jsonLogic.apply(questionnaire.entry, {
      gender,
      potentialInsurance,
      entry: nextQ,
      weightLossFlow: sessionStorage.getItem('weight-loss-flow'),
      BMI,
      variant,
      variant7743,
    });

    Router.push(`${name}/${entry}`);
  }, [
    patient,
    questionnaire.entry,
    potentialInsurance,
    nextQ,
    BMI,
    variant,
    name,
  ]);

  // const { intro } = questionnaire;

  return (
    <OnboardingLayout>
      <Head>
        <title>{siteName} | Questions</title>
      </Head>
      <CenteredContainer maxWidth="sm">
        {intro ? (
          <QuestionIntro intro={intro} onClick={onClick} />
        ) : (
          <Loading />
        )}
      </CenteredContainer>
    </OnboardingLayout>
  );
};

export const getServerSideProps = getAuthProps;

export default QuestionnairePage;
