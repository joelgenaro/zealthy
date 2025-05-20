import Head from 'next/head';
import { ReactElement } from 'react';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import { Button, Container, Stack, Typography } from '@mui/material';
import { useIntakeState } from '@/components/hooks/useIntake';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useInsuranceState } from '@/components/hooks/useInsurance';
import { useRedirectUser } from '@/components/hooks/useRedirectUser';
import { usePatient } from '@/components/hooks/data';
import InsuranceCovered from '@/components/shared/InsuranceCovered';

const EligibleInsurance = () => {
  const isMobile = useIsMobile();
  const { potentialInsurance } = useIntakeState();
  const { member_obligation, co_insurance } = useInsuranceState();
  const { data: patient } = usePatient();
  const redirectUser = useRedirectUser(patient?.id);

  return (
    <>
      <Head>
        <title>Insurance Accepted | Onboarding | Zealthy</title>
      </Head>
      <Container maxWidth="sm">
        <Stack gap={4}>
          <Typography variant="h2" textAlign="center">
            Your insurance has been accepted!
          </Typography>
          {potentialInsurance ===
          PotentialInsuranceOption.BLUE_CROSS_ILLINOIS ? (
            <Stack gap={4}>
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
                      {!!(member_obligation || co_insurance)
                        ? `We believe with that your visit will cost you ${
                            member_obligation
                              ? `$${member_obligation} co-pay`
                              : co_insurance
                              ? `${co_insurance * 100}% co-insurance`
                              : 'less than $200'
                          }
                      with Blue Cross Blue Shield of Illinois. This is based on
                      what we were able to retrieve about your plan details, but
                      this amount may vary based on details we don't have on
                      your specific plan.`
                        : "Blue Cross Blue Shield of Illinois is covering your visit but you may have a co-pay or co-insurance. This amount may vary based on details we don't have on your specific plan."}
                    </Typography>
                  </li>
                  <li style={{ marginBottom: '1rem' }}>
                    <Typography>
                      {`The value of this visit is up to $200. Because we're in
                      network with Blue Cross of Illinois, you are able to pay
                      as little as $0 depending on your co-pay or coinsurance.`}
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
            <>
              <Typography>
                Because of our partnership with your insurance provider, you
                will only have to pay a small co-pay, often as little as $0.
              </Typography>
              <Button
                size="small"
                sx={{
                  width: '100%',
                  maxWidth: '375px',
                  margin: '0 auto',
                }}
                onClick={() => Router.push(Pathnames.SCHEDULE_VISIT)}
              >
                Continue
              </Button>
            </>
          )}
        </Stack>
      </Container>
    </>
  );
};

EligibleInsurance.getLayout = (page: ReactElement) => (
  <OnboardingLayout>{page}</OnboardingLayout>
);

export default EligibleInsurance;
