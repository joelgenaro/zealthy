import Head from 'next/head';
import { ReactElement } from 'react';
import { Button, Container, Stack, Typography } from '@mui/material';
import VisitSummary from '@/components/shared/VisitSummary';
import { getAuthProps } from '@/lib/auth';
import { useAppointmentSelect } from '@/components/hooks/useAppointment';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';

const VisitConfirmation = () => {
  const appointment = useAppointmentSelect(appointments =>
    appointments.find(a => a.appointment_type === 'Provider')
  );

  if (!appointment) {
    return Router.replace(Pathnames.PATIENT_PORTAL);
  }

  return (
    <Container>
      <Head>
        <title>Visit Scheduled | Zealthy</title>
      </Head>
      <Stack gap="3rem" maxWidth="500px" margin="0 auto">
        <Stack gap="1rem">
          <Typography variant="h2">Your visit was scheduled</Typography>
          {appointment.provider && (
            <VisitSummary isConfirmed={true} appointment={appointment} />
          )}
        </Stack>
        <Button
          size="large"
          onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}
        >
          Go Home
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
