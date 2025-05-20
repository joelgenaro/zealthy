import Head from 'next/head';
import VisitMessage from '@/components/screens/VisitStart/VisitMessage';
import { Box, Button, Container } from '@mui/material';
import { ReactElement } from 'react';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';

const UnableValidateInsurance = () => {
  return (
    <>
      <Head>
        <title>Zealthy | Patient Portal | Unable validate insurance</title>
      </Head>
      <Container maxWidth="sm">
        <VisitMessage
          title="Unfortunately, Zealthy is unable to validate your insurance details."
          body="Don’t worry, we offer highly affordable care that doesn’t require insurance!"
        >
          <Box display="flex" flexDirection="column" gap="16px">
            <Button onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}>
              Continue to home
            </Button>
            <Button
              color="grey"
              onClick={() =>
                Router.push(Pathnames.PATIENT_PORTAL_UPDATE_INSURANCE)
              }
            >
              Enter insurance details again
            </Button>
          </Box>
        </VisitMessage>
      </Container>
    </>
  );
};

UnableValidateInsurance.getLayout = (page: ReactElement) => (
  <OnboardingLayout>{page}</OnboardingLayout>
);

export default UnableValidateInsurance;
