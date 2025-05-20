import Head from 'next/head';
import { ReactElement } from 'react';
import { Button, Container, Stack, Typography } from '@mui/material';
import VisitSummary from '@/components/shared/VisitSummary';
import { getAuthProps } from '@/lib/auth';
import { useAppointmentSelect } from '@/components/hooks/useAppointment';
import Router from 'next/router';
import router from 'next/router';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';

const VisitConfirmation = () => {
  const { id } = router.query;
  const appointment = useAppointmentSelect(appointments =>
    appointments.find(a => a.appointment_type === 'Provider')
  );

  const handleContinue = () => {
    Router.replace('/schedule-now/schedule-appointment?id=' + id);
  };

  if (!appointment) {
    return null;
  }

  return (
    <Container>
      <Head>
        <title>Visit Selected | Zealthy</title>
      </Head>
      <Stack gap="3rem" maxWidth="500px" margin="0 auto">
        <Stack gap="1rem">
          <Typography variant="h2">Confirm your visit selection</Typography>
          {appointment.provider && (
            <VisitSummary isConfirmed={false} appointment={appointment} />
          )}
        </Stack>
        <Button size="large" onClick={handleContinue}>
          Schedule now
        </Button>
      </Stack>
    </Container>
  );
};

export const getServerSideProps = getAuthProps;

VisitConfirmation.getLayout = (page: ReactElement) => (
  <DefaultNavLayout>{page}</DefaultNavLayout>
);

export default VisitConfirmation;
