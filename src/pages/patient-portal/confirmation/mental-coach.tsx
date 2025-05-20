import Head from 'next/head';
import { ReactElement, useCallback } from 'react';
import Title from '@/components/shared/Title';
import { Button, Container, Stack } from '@mui/material';
import { getAuthProps } from '@/lib/auth';
import {
  useAppointmentActions,
  useAppointmentSelect,
} from '@/components/hooks/useAppointment';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import VisitSummary from '@/components/shared/VisitSummary';
import { useCoachingActions } from '@/components/hooks/useCoaching';
import { useSelector } from '@/components/hooks/useSelector';
import Footer from '@/components/shared/layout/Footer';
import { useActivePatientSubscription } from '@/components/hooks/data';

const VisitConfirmation = () => {
  const appointment = useAppointmentSelect(appointments =>
    appointments.find(a => a.appointment_type === 'Coach (Mental Health)')
  );
  const { data: subscriptions } = useActivePatientSubscription();

  const handleContinue = useCallback(() => {
    if (
      subscriptions?.some(
        sub => sub.subscription.name === 'Mental Health Coaching'
      )
    ) {
      Router.push(Pathnames.PATIENT_PORTAL);
    } else {
      Router.push(Pathnames.PATIENT_PORTAL_ADD_ON_COACH);
    }
  }, [subscriptions]);

  if (!appointment) {
    return null;
  }

  return (
    <Container sx={{ marginBottom: '24px' }}>
      <Head>
        <title>Visit confirmed | Zealthy</title>
      </Head>
      <Stack gap="3rem" maxWidth="448px" margin="0 auto">
        <Title text={`Your 1:1 mental health coaching session is scheduled.`} />
        {appointment.provider && (
          <VisitSummary isConfirmed={true} appointment={appointment} />
        )}

        <Button onClick={handleContinue}>Continue</Button>
      </Stack>
      <Footer />
    </Container>
  );
};

export const getServerSideProps = getAuthProps;

VisitConfirmation.getLayout = (page: ReactElement) => (
  <PatientPortalNav>{page}</PatientPortalNav>
);

export default VisitConfirmation;
