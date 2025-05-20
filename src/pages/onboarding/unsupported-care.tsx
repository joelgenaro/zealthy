import Head from 'next/head';
import { Button, Container, Typography } from '@mui/material';
import { ReactElement } from 'react';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { getAuthProps } from '@/lib/auth';
import { Pathnames } from '@/types/pathnames';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import Router from 'next/router';

const CareUnsupported = () => {
  const { specificCare } = useIntakeState();
  const { addSpecificCare } = useIntakeActions();
  function handleClick() {
    addSpecificCare(null);
    Router.push(Pathnames.CARE_SELECTION);
  }
  return (
    <>
      <Head>
        <title>Zealthy | Onboarding | Sex Unsupported</title>
      </Head>
      <Container maxWidth="xs">
        <Typography sx={{ marginBottom: '1rem' }}>
          {`Based on your sex assigned at birth, you may not be a candidate for Zealthy's ${specificCare?.toLowerCase()} treatment.`}
        </Typography>
        <Typography sx={{ marginBottom: '3rem' }}>
          {
            'Go back to select a different sex assigned at birth or select continue below to move forward with the sex assigned at birth you selected on the previous screen to seek care for a different Zealthy offering.'
          }
        </Typography>
        <Button fullWidth onClick={handleClick}>
          Continue
        </Button>
      </Container>
    </>
  );
};

export const getServerSideProps = getAuthProps;

CareUnsupported.getLayout = (page: ReactElement) => (
  <OnboardingLayout back={Pathnames.COMPLETE_PROFILE}>{page}</OnboardingLayout>
);

export default CareUnsupported;
