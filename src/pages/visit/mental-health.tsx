import { ReactElement, useCallback, useEffect, useState } from 'react';
import { Button, Container, Stack, Typography } from '@mui/material';
import { getAuthProps } from '@/lib/auth';
import Head from 'next/head';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { useVisitSelect } from '@/components/hooks/useVisit';
import { useEarliestAppointment } from '@/components/hooks/useEarliestAppointment';
import { preCheckoutNavigation } from '@/utils/precheckoutNavigation';
import Router from 'next/router';
import Loading from '@/components/shared/Loading/Loading';

const MentalHealthVisit = () => {
  const { earliestAppointment: appointment, ellipsis } =
    useEarliestAppointment();
  const questionnaire = useVisitSelect(visit => visit.questionnaires[0]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!appointment) {
      const timeout = setTimeout(() => {
        if (!appointment) {
          setError(
            'We had trouble loading appointment times. Please try again.'
          );
        }
      }, 15000);
      return () => clearTimeout(timeout);
    }
  }, [appointment]);

  const handleClick = useCallback(() => {
    try {
      setIsLoading(true);
      const nextPage = preCheckoutNavigation(questionnaire);
      if (nextPage) Router.push(nextPage);
      else {
        setError(
          'We had trouble navigating to the next step. Please try again.'
        );
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error during navigation:', err);
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  }, [questionnaire]);

  const handleRetry = () => {
    setError(null);
    window.location.reload();
  };

  if (error) {
    return (
      <Container maxWidth="sm">
        <Stack
          direction="column"
          gap="24px"
          alignItems="center"
          justifyContent="center"
          minHeight="50vh"
        >
          <Typography variant="h2" textAlign="center">
            Something went wrong
          </Typography>
          <Typography textAlign="center">{error}</Typography>
          <Button variant="contained" onClick={handleRetry}>
            Try Again
          </Button>
        </Stack>
      </Container>
    );
  }

  if (!appointment || isLoading) {
    return (
      <Container maxWidth="sm">
        <Stack
          direction="column"
          gap="16px"
          alignItems="center"
          justifyContent="center"
          minHeight="50vh"
        >
          <Loading />
          <Typography textAlign="center">
            {isLoading
              ? 'Preparing your questionnaire...'
              : `Finding available appointments${ellipsis}`}
          </Typography>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Head>
        <title>Zealthy</title>
      </Head>
      <Stack direction="column" gap="48px">
        <Stack direction="column" gap="16px">
          <Typography variant="h2">{'You’re in the right place!'}</Typography>
          <Typography>
            {`Mental health appointments are available in your area as soon as ${appointment}.`}
          </Typography>
          <Typography>
            {
              'After completing a free emotional assessment, you’ll be able to sign up for psychiatric care and book an appointment. If prescribed, medications such as generic Prozac and generic Wellbutrin are included. We do not prescribe controlled substances such as Adderall or Xanax.'
            }
          </Typography>
        </Stack>
        <Button fullWidth onClick={handleClick}>
          {'Continue'}
        </Button>
      </Stack>
    </Container>
  );
};
export const getServerSideProps = getAuthProps;

MentalHealthVisit.getLayout = (page: ReactElement) => {
  return <OnboardingLayout>{page}</OnboardingLayout>;
};

export default MentalHealthVisit;
