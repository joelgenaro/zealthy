import Head from 'next/head';
import Router, { useRouter } from 'next/router';
import CheckMark from '@/components/shared/icons/CheckMark';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { getAuthProps } from '@/lib/auth';
import { Button, Stack, Typography } from '@mui/material';
import { QuestionnaireName } from '@/types/questionnaire';
import { envMapping } from '@/questionnaires';
import { useCallback, useEffect } from 'react';
import { usePatient } from '@/components/hooks/data';
import jsonLogic from 'json-logic-js';
import getConfig from '../../../../../config';

const QuestionnairePage = () => {
  const {
    query: { name },
  } = useRouter();
  const questionnaire = envMapping[name as QuestionnaireName];
  const { data: patient } = usePatient();

  if (!questionnaire) {
    throw new Error(`questionnaire ${name} is not defined`);
  }

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  useEffect(() => {
    if (!questionnaire.intro) {
      if (!patient) return;

      const {
        profiles: { gender },
      } = patient;

      const entry = jsonLogic.apply(questionnaire.entry, { gender });

      Router.push(`${name}/${entry}`);
    }
  }, [name, patient, questionnaire.entry, questionnaire.intro]);

  const onClick = useCallback(() => {
    if (!patient) return;
    const {
      profiles: { gender },
    } = patient;

    const entry = jsonLogic.apply(questionnaire.entry, { gender });

    Router.push(`${name}/${entry}`);
  }, [name, patient, questionnaire.entry]);

  return (
    <OnboardingLayout>
      <Head>
        <title>{siteName} | Questions</title>
      </Head>
      <CenteredContainer maxWidth="sm">
        <Stack gap={6}>
          <Stack gap="16px">
            <Typography variant="h2">{questionnaire.intro?.header}</Typography>
            <Typography>{questionnaire.intro?.description}</Typography>
            <Stack direction="column" gap="10px">
              {questionnaire.intro?.listItems?.map(item => (
                <Stack
                  key={item}
                  direction="row"
                  gap="16px"
                  alignItems="center"
                >
                  <CheckMark width="18px" height="14px" />
                  <Typography>{item}</Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
          <Button onClick={onClick}>
            {questionnaire.intro?.buttonText || 'Continue'}
          </Button>
        </Stack>
      </CenteredContainer>
    </OnboardingLayout>
  );
};

export const getServerSideProps = getAuthProps;

export default QuestionnairePage;
