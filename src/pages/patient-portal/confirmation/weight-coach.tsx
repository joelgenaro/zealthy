import Head from 'next/head';
import { ReactElement, useCallback } from 'react';
import Title from '@/components/shared/Title';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import { getAuthProps } from '@/lib/auth';
import {
  useAppointmentAsync,
  useAppointmentSelect,
} from '@/components/hooks/useAppointment';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import VisitSummary from '@/components/shared/VisitSummary';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import { usePatient } from '@/components/hooks/data';

const VisitConfirmation = () => {
  const { updateAppointment } = useAppointmentAsync();
  const { data: patient } = usePatient();
  const appointment = useAppointmentSelect(appointments =>
    appointments.find(a => a.appointment_type === 'Coach (Weight Loss)')
  );

  const handleContinue = useCallback(() => {
    if (appointment) {
      Router.push(Pathnames.PATIENT_PORTAL);
      updateAppointment(
        appointment.id,
        {
          status: 'Confirmed',
        },
        patient!
      );
    }
  }, [appointment, patient]);

  if (!appointment) {
    return null;
  }

  return (
    <Container sx={{ marginBottom: '24px' }}>
      <Head>
        <title>Visit confirmed | Zealthy</title>
      </Head>
      <Stack gap="3rem" maxWidth="448px" margin="0 auto">
        <Title text={`Your 1:1 weight loss coaching session is scheduled.`} />
        {appointment.provider && (
          <VisitSummary isConfirmed={true} appointment={appointment} />
        )}

        <Button onClick={handleContinue}>Continue</Button>
      </Stack>
    </Container>
  );
};

export const getServerSideProps = getAuthProps;

VisitConfirmation.getLayout = (page: ReactElement) => (
  <PatientPortalNav>{page}</PatientPortalNav>
);

export default VisitConfirmation;
