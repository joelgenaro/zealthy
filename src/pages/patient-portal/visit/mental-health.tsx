import { ReactElement } from 'react';
import { Button, Container, Stack, Typography } from '@mui/material';
import { getAuthProps } from '@/lib/auth';
import Head from 'next/head';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import { useVisitSelect } from '@/components/hooks/useVisit';
import { useEarliestAppointment } from '@/components/hooks/useEarliestAppointment';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import Loading from '@/components/shared/Loading/Loading';

const MentalHealthVisit = () => {
  const { earliestAppointment: appointment } = useEarliestAppointment();
  const questionnaireName = useVisitSelect(
    visit => visit.questionnaires[0].name
  );
  const handleClick = () => {
    Router.push(
      `${Pathnames.PATIENT_PORTAL_QUESTIONNAIRES}/${questionnaireName}`
    );
  };

  return (
    <Container maxWidth="sm">
      <Head>
        <title>Zealthy</title>
      </Head>
      {!appointment ? (
        <Loading />
      ) : (
        <Stack direction="column" gap="48px">
          <Stack direction="column" gap="16px">
            <Typography variant="h2">{'You’re in the right place!'}</Typography>
            <Typography>
              {`Mental health appointments are available in your area as soon as ${appointment}.`}
            </Typography>
            <Typography>
              {
                'After completing a free emotional assessment, you’ll be able to sign up for psychiatric care and book an appointment.'
              }
            </Typography>
          </Stack>
          <Button fullWidth onClick={handleClick}>
            {'Continue'}
          </Button>
        </Stack>
      )}
    </Container>
  );
};
export const getServerSideProps = getAuthProps;

MentalHealthVisit.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default MentalHealthVisit;
