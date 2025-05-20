import Head from 'next/head';
import Router, { useRouter } from 'next/router';
import CheckMark from '@/components/shared/icons/CheckMark';
import { getAuthProps } from '@/lib/auth';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import { QuestionnaireName } from '@/types/questionnaire';
import { envMapping } from '@/questionnaires';
import Footer from '@/components/shared/layout/Footer';
import { useCallback, useEffect, useMemo } from 'react';
import jsonLogic from 'json-logic-js';
import {
  useActivePatientSubscription,
  usePatient,
} from '@/components/hooks/data';
import Loading from '@/components/shared/Loading/Loading';

const QuestionnairePage = () => {
  const {
    query: { name },
  } = useRouter();
  const questionnaire = envMapping[name as QuestionnaireName];
  const { data: patient } = usePatient();
  const { data: patientSubscriptions = [] } = useActivePatientSubscription();

  if (!questionnaire) {
    throw new Error(`questionnaire ${name} is not defined`);
  }

  const isRecurringMedicationSubscription = useMemo(() => {
    return patientSubscriptions.some(sub =>
      sub.product?.toLowerCase().includes('recurring weight loss')
    );
  }, [patientSubscriptions]);

  useEffect(() => {
    if (!questionnaire.intro) {
      if (!patient) return;

      const {
        profiles: { gender },
      } = patient;

      const entry = jsonLogic.apply(questionnaire.entry, {
        gender,
        isRecurringMedicationSubscription,
      });

      Router.push(`${name}/${entry}`);
    }
  }, [name, patient, questionnaire.entry, questionnaire.intro]);

  const onClick = useCallback(() => {
    if (!patient) return;
    const {
      profiles: { gender },
    } = patient;

    const entry = jsonLogic.apply(questionnaire.entry, {
      gender,
      isRecurringMedicationSubscription,
    });
    Router.push(`${name}/${entry}`);
  }, [name, patient, questionnaire.entry]);

  const header = useMemo(() => {
    if (!questionnaire.intro || !questionnaire.intro.header) {
      return null;
    }

    return jsonLogic.apply(questionnaire.intro.header, {
      isRecurringMedicationSubscription,
    });
  }, [questionnaire.intro, isRecurringMedicationSubscription]);

  return (
    <PatientPortalNav>
      <Head>
        <title>Zealthy | Questions</title>
      </Head>
      <Container style={{ maxWidth: '450px' }}>
        {questionnaire?.intro ? (
          <Stack gap={4}>
            <Stack gap="16px">
              {Array.isArray(header) ? (
                <Stack gap={3}>
                  <Typography variant="h2">{header[0]}</Typography>
                  <Typography variant="h2">{header[1]}</Typography>
                </Stack>
              ) : (
                <Typography variant="h2">{header}</Typography>
              )}
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
        ) : (
          <Loading />
        )}
      </Container>
      <Footer />
    </PatientPortalNav>
  );
};

export const getServerSideProps = getAuthProps;

export default QuestionnairePage;
