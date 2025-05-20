import Head from 'next/head';
import { ReactElement } from 'react';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { Button, Container, Stack, Typography } from '@mui/material';
import { usePatient } from '@/components/hooks/data';
import { useRedirectUser } from '@/components/hooks/useRedirectUser';

const SkipInsurance = () => {
  const { data: patient } = usePatient();
  const redirectUser = useRedirectUser(patient?.id);

  return (
    <>
      <Head>
        <title>Insurance Eligible | Onboarding | Zealthy</title>
      </Head>
      <Container maxWidth="sm">
        <Stack gap={4}>
          <Typography variant="h2" textAlign="center">
            {"Congrats, you're eligible for treatment!"}
          </Typography>

          <Stack gap={2}>
            <Typography>
              Here is how you can use your insurance to pay for care at Zealthy:
            </Typography>
            <ul style={{ padding: '0 25px', margin: 0 }}>
              <li style={{ marginBottom: '1rem' }}>
                <Typography>You will pay $99 for your visit upfront</Typography>
              </li>
              <li style={{ marginBottom: '1rem' }}>
                <Typography>
                  Zealthy will then work with your insurance provider to get up
                  to 100% of your visit reimbursed; most patients will get back
                  50-70% of the visit price back when we submit your visit
                  information to Blue Cross Blue Shield of Illinois
                </Typography>
              </li>
            </ul>
          </Stack>
          <Button
            size="small"
            sx={{
              width: '100%',
              maxWidth: '375px',
              margin: '0 auto',
            }}
            onClick={redirectUser}
          >
            Continue
          </Button>
        </Stack>
      </Container>
    </>
  );
};

SkipInsurance.getLayout = (page: ReactElement) => (
  <OnboardingLayout>{page}</OnboardingLayout>
);

export default SkipInsurance;
