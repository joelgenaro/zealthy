import Head from 'next/head';
import { Button, Container, Stack, Typography } from '@mui/material';
import { ReactElement } from 'react';
import { getAuthProps } from '@/lib/auth';
import { Pathnames } from '@/types/pathnames';
import NoNavLayout from '@/layouts/NoNavLayout';
import Router from 'next/router';
import { usePatientState } from '@/components/hooks/usePatient';
import { useVisitActions, useVisitState } from '@/components/hooks/useVisit';
import { useConsultationActions } from '@/components/hooks/useConsultation';
import { ConsultationType } from '@/context/AppContext/reducers/types/consultation';
import getConfig from '../../../config';

const SkincareSuccess = () => {
  const { canvas_patient_id } = usePatientState();
  const { addAsync } = useVisitActions();
  const { selectedCare, id: visitId } = useVisitState();
  const { addConsultation } = useConsultationActions();

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  async function onContinue() {
    addAsync(false);
    addConsultation({
      name: `Skincare Medical Consultation`,
      price: 50,
      discounted_price: 20,
      type: 'Skincare' as ConsultationType,
      concerns: selectedCare?.careSelections.map(c => c.reason) || [],
    });
    if (canvas_patient_id) {
      Router.push(Pathnames.WHAT_NEXT);
    } else {
      Router.push(
        ['Zealthy', 'FitRx'].includes(siteName ?? '')
          ? Pathnames.REGION_SCREEN
          : Pathnames.REGION_SCREEN_ZP
      );
    }
  }

  return (
    <>
      <Head>
        <title>Zealthy | Onboarding | Success</title>
      </Head>
      <Container maxWidth="sm">
        <Stack gap={6} textAlign="center">
          <Stack gap={2} alignSelf="center" maxWidth="500px">
            <Typography variant="h2">It looks like we can help!</Typography>
            <Typography>
              {`Based on your responses, it looks like we should be able to help
              with a prescription skincare treatment plan. Just answer a few
              more questions to confirm that you’re eligible.`}
            </Typography>
          </Stack>
          <Button
            style={{ width: '270px', alignSelf: 'center' }}
            onClick={onContinue}
          >
            Continue
          </Button>
        </Stack>
      </Container>
    </>
  );
};

export const getServerSideProps = getAuthProps;

SkincareSuccess.getLayout = (page: ReactElement) => (
  <NoNavLayout>{page}</NoNavLayout>
);

export default SkincareSuccess;
