import Head from 'next/head';
import Router from 'next/router';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import { getAuthProps } from '@/lib/auth';
import { Typography, Stack, Button } from '@mui/material';
import { Pathnames } from '@/types/pathnames';
import Footer from '@/components/shared/layout/Footer';

const LabcorpEmail = () => {
  return (
    <>
      <Head>
        <title>Zealthy | Labcorp Email</title>
      </Head>
      <CenteredContainer maxWidth="sm">
        <Stack gap={{ sm: 6, xs: 3 }}>
          <Stack gap={2}>
            <Typography variant="h2">
              Sounds good; we messaged your provider, who will follow up to
              request lab work!
            </Typography>
            <Typography>
              Please check your messages and email within the next two business
              days. We will provide instructions for scheduling lab work at a
              Quest or Labcorp facility near you or let you know if you&apos;re
              ineligible.
            </Typography>
          </Stack>
          <Button onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}>
            Continue
          </Button>
        </Stack>
      </CenteredContainer>
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

LabcorpEmail.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default LabcorpEmail;
