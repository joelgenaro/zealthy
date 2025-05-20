import Head from 'next/head';
import { ReactElement } from 'react';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import VisitMessage from '@/components/screens/VisitStart/VisitMessage';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import { Button, Container, Stack, Typography } from '@mui/material';
import { useIntakeState } from '@/components/hooks/useIntake';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { usePatient } from '@/components/hooks/data';
import { useRedirectUser } from '@/components/hooks/useRedirectUser';
import InsuranceCovered from '@/components/shared/InsuranceCovered';

const listItems = [
  { title: 'You will pay $99 for your visit upfront', body: '' },
  {
    title:
      'Zealthy will then work with your insurance provider to get up to 70% of your visit reimbursed',
    body: '',
  },
  {
    title:
      'Your insurance reimbursement will either be received via your Zealthy payment method or by a check to your mailing address from your insurance provider',
    body: '',
  },
];
const EligibleInsurance = () => {
  const isMobile = useIsMobile();
  const { potentialInsurance } = useIntakeState();
  const { data: patient } = usePatient();
  const redirectUser = useRedirectUser(patient?.id);

  function handleContinue() {
    if (potentialInsurance === PotentialInsuranceOption.OUT_OF_NETWORK_V2) {
      Router.push(Pathnames.WHAT_NEXT);
    } else {
      Router.push(Pathnames.SCHEDULE_VISIT);
    }
  }

  return (
    <>
      <Head>
        <title>Insurance Eligible | Onboarding | Zealthy</title>
      </Head>
      <Container maxWidth="sm">
        {potentialInsurance === PotentialInsuranceOption.BLUE_CROSS_ILLINOIS ? (
          <Stack gap={4}>
            <Typography variant="h2" textAlign="center">
              Your insurance has been accepted!
            </Typography>
            <InsuranceCovered message="Your insurance has you covered!" />
            <Typography>
              Exciting update! You qualify for this, but keep in mind that the
              expenses provided are approximate and could be subject to
              adjustments based on your deductible. To obtain an exact cost,
              reach out to your insurance provider.
            </Typography>
            <Stack gap={2}>
              <Typography>
                Here is how you can use your insurance to pay for care at
                Zealthy:
              </Typography>
              <ul style={{ padding: '0 25px', margin: 0 }}>
                <li style={{ marginBottom: '1rem' }}>
                  <Typography>
                    You will pay $99 for your visit upfront
                  </Typography>
                </li>
                <li style={{ marginBottom: '1rem' }}>
                  <Typography>
                    Zealthy will then work with your insurance provider to get
                    up to 100% of your visit reimbursed; most patients will get
                    back 50-70% of the visit price back when we submit your
                    visit information to Blue Cross Blue Shield of Illinois
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
        ) : (
          <VisitMessage
            title="Your insurance has been accepted!"
            body="Here is how you can use your insurance to pay for care at Zealthy:"
            listItems={listItems}
            numberedList={false}
          >
            <Button onClick={handleContinue}>
              {potentialInsurance == PotentialInsuranceOption.OUT_OF_NETWORK_V2
                ? 'Continue'
                : 'Continue to high-quality care'}
            </Button>
          </VisitMessage>
        )}
      </Container>
    </>
  );
};

EligibleInsurance.getLayout = (page: ReactElement) => (
  <OnboardingLayout>{page}</OnboardingLayout>
);

export default EligibleInsurance;
