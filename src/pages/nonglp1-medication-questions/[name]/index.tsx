import Head from 'next/head';
import Router, { useRouter } from 'next/router';
import { Button, Container, Stack, Typography } from '@mui/material';
import { ReactElement, useCallback, useEffect } from 'react';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import jsonLogic from 'json-logic-js';
import { Pathnames } from '@/types/pathnames';
import { usePatient } from '@/components/hooks/data';
import { useIntakeState } from '@/components/hooks/useIntake';
import { envMapping } from '@/questionnaires';
import { QuestionnaireName } from '@/types/questionnaire';
import CheckMark from '@/components/shared/icons/CheckMark';
import Loading from '@/components/shared/Loading/Loading';
import { useVisitSelect } from '@/components/hooks/useVisit';

const NonGLP1MedsPage = () => {
  const {
    query: { name },
  } = useRouter();

  const questionnaire = envMapping[name as QuestionnaireName];

  const { data: patient } = usePatient();
  const { potentialInsurance } = useIntakeState();
  const medications = useVisitSelect(visit => visit.medications);

  const bupropionSelected = medications.some(med =>
    med.name.toLowerCase().includes('bupropion')
  );

  useEffect(() => {
    if (!questionnaire?.intro) {
      if (!patient) return;
      if (!questionnaire?.entry) return;

      const {
        profiles: { gender },
      } = patient;

      const entry = jsonLogic.apply(questionnaire?.entry, {
        gender,
        potentialInsurance,
        bupropionSelected,
      });

      Router.push(`${Pathnames.NON_GLP1_MEDICATIONS}/${name}/${entry}`);
    }
  }, [name, patient, questionnaire?.entry, questionnaire?.intro]);

  const onClick = useCallback(() => {
    if (!patient) return;
    if (!questionnaire?.entry) return;
    const {
      profiles: { gender },
    } = patient;

    const entry = jsonLogic.apply(questionnaire?.entry, {
      gender,
      potentialInsurance,
      bupropionSelected,
    });

    Router.push(`${name}/${entry}`);
  }, [name, patient, questionnaire?.entry]);

  if (!questionnaire) {
    return null;
  }

  const { intro } = questionnaire;
  return (
    <>
      <Head>
        <title>Non-GLP1 Medication | Zealthy</title>
      </Head>
      <Container style={{ maxWidth: '500px' }}>
        {intro ? (
          <>
            <Stack gap="30px">
              {intro.header ? (
                <Typography variant="h2">{intro.header}</Typography>
              ) : null}
              {intro.description ? (
                <Typography>{intro?.description}</Typography>
              ) : null}
              {intro.listItems ? (
                <Stack direction="column" gap="10px">
                  {intro.listItems.map(item => (
                    <Stack key={item} direction="row" gap="16px">
                      <Typography paddingTop="2px">
                        <CheckMark width="18px" height="14px" />
                      </Typography>
                      <Typography>{item}</Typography>
                    </Stack>
                  ))}
                </Stack>
              ) : null}
              <Button fullWidth onClick={onClick}>
                {questionnaire.intro?.buttonText || 'Continue'}
              </Button>
            </Stack>
          </>
        ) : (
          <Loading />
        )}
      </Container>
    </>
  );
};

NonGLP1MedsPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default NonGLP1MedsPage;
