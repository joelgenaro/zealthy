import { ReactElement, useCallback } from 'react';
import { Button, Container, Stack, Typography } from '@mui/material';
import { getAuthProps } from '@/lib/auth';
import Head from 'next/head';
import Router from 'next/router';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { useVisitSelect } from '@/components/hooks/useVisit';
import { preCheckoutNavigation } from '@/utils/precheckoutNavigation';
import { useEarliestAppointment } from '@/components/hooks/useEarliestAppointment';
import Loading from '@/components/shared/Loading/Loading';
import { useIntakeState } from '@/components/hooks/useIntake';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';

const PrimaryCareVisit = () => {
  const { earliestAppointment: appointment } = useEarliestAppointment();
  const questionnaire = useVisitSelect(visit => visit.questionnaires[0]);
  const { potentialInsurance } = useIntakeState();
  const handleClick = useCallback(() => {
    const nextPage = preCheckoutNavigation(questionnaire);
    if (nextPage) Router.push(nextPage);
  }, [questionnaire]);

  return (
    <Container maxWidth="xs">
      <Head>
        <title>Primary Care | Zealthy</title>
      </Head>
      {!appointment ? (
        <Loading />
      ) : (
        <Stack direction="column" gap="48px" alignItems="start">
          <Stack
            direction="column"
            gap="16px"
            alignItems="start"
            textAlign="start"
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: '32px',
                fontWeight: '700',
                lineHeight: '38px',
              }}
            >
              {'You’re in the right place!'}
            </Typography>
            <Typography>
              {potentialInsurance ===
              PotentialInsuranceOption.BLUE_CROSS_ILLINOIS
                ? `Online visits are available in your area!`
                : `Primary care appointments are available in your area as soon as ${appointment}.`}
            </Typography>

            <Typography>
              {potentialInsurance ===
              PotentialInsuranceOption.BLUE_CROSS_ILLINOIS
                ? 'We’ve used your responses to recommend providers who are in network with Blue Cross of Illinois.'
                : 'We’ve used your responses to recommend a few primary care providers for you to select from and book with.'}
            </Typography>
          </Stack>
          <Button fullWidth onClick={handleClick}>
            {'Continue to book now'}
          </Button>
        </Stack>
      )}
    </Container>
  );
};
export const getServerSideProps = getAuthProps;

PrimaryCareVisit.getLayout = (page: ReactElement) => {
  return <OnboardingLayout>{page}</OnboardingLayout>;
};

export default PrimaryCareVisit;
