import Head from 'next/head';
import VisitMessage from '@/components/screens/VisitStart/VisitMessage';
import { Box, Button, Container } from '@mui/material';
import { ReactElement, useCallback, useState } from 'react';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';
import { useRedirectUser } from '@/components/hooks/useRedirectUser';
import { getAuthProps } from '@/lib/auth';
import { Database } from '@/lib/database.types';
import LoadingButton from '@/components/shared/Button/LoadingButton';

interface UnableValidateInsuranceProps {
  patient: Database['public']['Tables']['patient']['Row'] | null;
  profile: Database['public']['Tables']['profiles']['Row'] | null;
}

const UnableValidateInsurance = ({
  patient,
  profile,
}: UnableValidateInsuranceProps) => {
  const [loading, setLoading] = useState(false);
  const redirectUser = useRedirectUser(patient?.id);

  const handleClick = useCallback(async () => {
    setLoading(true);
    await redirectUser();
    setLoading(false);
  }, [redirectUser]);
  return (
    <>
      <Head>
        <title>Zealthy | Onboarding | Unable validate insurance</title>
      </Head>
      <Container maxWidth="sm">
        <VisitMessage
          title="Unfortunately, Zealthy is unable to validate your insurance details."
          body="Don’t worry, we offer highly affordable care that doesn’t require insurance!"
        >
          <Box display="flex" flexDirection="column" gap="16px">
            <LoadingButton
              loading={loading}
              disabled={loading}
              onClick={handleClick}
            >
              Continue without insurance
            </LoadingButton>
            <Button
              color="grey"
              onClick={() => Router.push(Pathnames.INSURANCE_CAPTURE)}
            >
              Enter insurance details again
            </Button>
          </Box>
        </VisitMessage>
      </Container>
    </>
  );
};

export const getServerSideProps = getAuthProps;

UnableValidateInsurance.getLayout = (page: ReactElement) => (
  <OnboardingLayout>{page}</OnboardingLayout>
);

export default UnableValidateInsurance;
