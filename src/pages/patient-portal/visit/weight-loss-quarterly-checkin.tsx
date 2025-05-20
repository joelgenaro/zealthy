import Head from 'next/head';
import { ReactElement, useEffect, useState } from 'react';
import Loading from '@/components/shared/Loading/Loading';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import {
  useVisitActions,
  useVisitAsync,
  useVisitState,
} from '@/components/hooks/useVisit';
import { mapCareToQuestionnaires } from '@/utils/mapCareToQuestionnaire';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { getAuthProps } from '@/lib/auth';
import { Button, Container, Stack, Typography } from '@mui/material';
import { useActivePatientSubscription } from '@/components/hooks/data';

const WeightLossQuarterlyCheckinPage = () => {
  const [showError, setShowError] = useState(false);
  const { id: visitID, questionnaires } = useVisitState();
  const { createOnlineVisit } = useVisitAsync();
  const { specificCare } = useIntakeState();
  const { addSpecificCare } = useIntakeActions();
  const { resetQuestionnaires, addQuestionnaires, addCare } = useVisitActions();
  const { data: patientSubscriptions } = useActivePatientSubscription();

  useEffect(() => {
    resetQuestionnaires();
    addCare({
      care: {
        careSelections: [],
        other: '',
      },
    });
    addSpecificCare(SpecificCareOption.WEIGHT_LOSS);
  }, []);

  async function createVisitOrRedirect() {
    await createOnlineVisit(false);
    addQuestionnaires(
      patientSubscriptions?.find(
        s => s.product === 'Recurring Weight Loss Medication'
      )
        ? mapCareToQuestionnaires(['Weight Loss Compound Refill Recurring'])
        : mapCareToQuestionnaires(['Weight Loss Checkin'])
    );
  }

  useEffect(() => {
    if (
      !questionnaires.length &&
      specificCare === SpecificCareOption.WEIGHT_LOSS &&
      patientSubscriptions?.length
    ) {
      createVisitOrRedirect();
    }
  }, [questionnaires, specificCare, patientSubscriptions?.length]);

  useEffect(() => {
    if (
      visitID &&
      questionnaires.length > 0 &&
      specificCare === SpecificCareOption.WEIGHT_LOSS
    ) {
      Router.push(Pathnames.PATIENT_PORTAL_QUESTIONNAIRES);
    }
  }, [questionnaires]);

  return (
    <>
      <Head>
        <title>Zealthy</title>
      </Head>
      <Container maxWidth="xs">
        {showError ? (
          <Stack gap={4}>
            <Typography variant="h2">
              You are unable to complete a refill request for weight loss since
              you already have a pending prescription being sent to a pharmacy
              or being shipped to you.
            </Typography>
            <Typography variant="h2">
              If you have questions about your prescription request, select
              below to message your care team.
            </Typography>
            <Button
              onClick={() =>
                Router.push(`${Pathnames.MESSAGES}?complete=weight-loss`)
              }
            >
              Message your care team
            </Button>
          </Stack>
        ) : (
          <Loading />
        )}
      </Container>
    </>
  );
};

export const getServerSideProps = getAuthProps;

WeightLossQuarterlyCheckinPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default WeightLossQuarterlyCheckinPage;
