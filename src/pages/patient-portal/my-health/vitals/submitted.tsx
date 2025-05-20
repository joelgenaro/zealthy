import Head from 'next/head';
import Router from 'next/router';
import { Button, Container, Stack, Typography } from '@mui/material';
import { getAuthProps } from '@/lib/auth';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import Footer from '@/components/shared/layout/Footer';
import SuccessCheckMarkIcon from '@/components/shared/icons/SuccessCheckMarkIcon';
import { Pathnames } from '@/types/pathnames';

const VitalsSubmittedPage = () => {
  return (
    <Container maxWidth="sm">
      <Head>
        <title>Submitted | Vitals | My Health | Zealthy</title>
      </Head>
      <Stack alignItems="center" gap={2} textAlign="center">
        <SuccessCheckMarkIcon />
        <Typography variant="h3">
          {'Thanks for updating your information!'}
        </Typography>
        <Typography variant="body1">
          {
            "We've notified your Zealthy care team who will use this when preparing your prescription."
          }
        </Typography>
        <Button
          style={{ marginTop: '1rem' }}
          onClick={() => Router.replace(Pathnames.PATIENT_PORTAL)}
        >
          Go Home
        </Button>
      </Stack>
      <Footer />
    </Container>
  );
};
export const getServerSideProps = getAuthProps;

VitalsSubmittedPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default VitalsSubmittedPage;
