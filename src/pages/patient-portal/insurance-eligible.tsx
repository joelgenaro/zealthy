import Head from 'next/head';
import { ReactElement } from 'react';
import VisitMessage from '@/components/screens/VisitStart/VisitMessage';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import { Button, Container } from '@mui/material';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';

const EligibleInsurance = () => {
  return (
    <>
      <Head>
        <title>Verify Eligible | Patient Portal | Zealthy</title>
      </Head>
      <Container maxWidth="sm">
        <VisitMessage
          title="Congratulations! You are eligible to use your insurance to pay for care at Zealthy."
          body="Zealthy can now provide you with the care you need for as little as $0."
        >
          <Button onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}>
            Continue to home
          </Button>
        </VisitMessage>
      </Container>
    </>
  );
};

EligibleInsurance.getLayout = (page: ReactElement) => (
  <PatientPortalNav>{page}</PatientPortalNav>
);

export default EligibleInsurance;
