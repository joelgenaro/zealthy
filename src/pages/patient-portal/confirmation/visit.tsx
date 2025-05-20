import Head from 'next/head';
import { ReactElement, useCallback, useState } from 'react';
import Title from '@/components/shared/Title';
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import VisitSummary from '@/components/shared/VisitSummary';
import { getAuthProps } from '@/lib/auth';
import {
  useAppointmentAsync,
  useAppointmentSelect,
} from '@/components/hooks/useAppointment';
import Router from 'next/router';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import { Pathnames } from '@/types/pathnames';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { usePatient } from '@/components/hooks/data';

const VisitConfirmation = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { appt } = Router.query;
  const { data: patient } = usePatient();
  const appointment = useAppointmentSelect(appointments =>
    appointments.find(a => a.appointment_type === 'Provider')
  );
  const { updateAppointment } = useAppointmentAsync();
  const [Loading, setLoading] = useState(false);

  const handleContinue = useCallback(() => {
    Router.push(Pathnames.PATIENT_PORTAL);
  }, []);

  const handleScheduleProviderVisit = () => {
    setLoading(true);

    updateAppointment(
      appointment!.id,
      {
        status: 'Confirmed',
        visit_type: 'Video',
        description: '15 minute sync visit with provider',
      },
      patient!
    )
      .then(() => {
        window?.freshpaint?.track('15-min-visit-scheduled');
        setLoading(false);
        appointment?.status === 'Confirmed'
          ? Router.push(Pathnames.PATIENT_PORTAL)
          : null;
      })
      .catch(error => {
        setLoading(false);
        console.error(error);
      });
  };

  if (!appointment) {
    throw new Error('No Appointments selected');
  }

  const handleReschedule = useCallback(() => {
    Router.push(
      `/schedule-appointment?id=${appointment?.provider?.id}&appt-id=${appointment?.id}`
    );
  }, [appointment?.id, appointment?.provider?.canvas_practitioner_id]);

  return (
    <Container sx={{ marginBottom: '24px' }}>
      <Head>
        <title>Visit confirmed | Zealthy</title>
      </Head>
      <Stack
        gap={isMobile ? '1.5rem' : '3rem'}
        maxWidth="448px"
        margin="0 auto"
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <Title
            text={
              appointment?.status === 'Requested'
                ? `Your video visit is ready to be confirmed.`
                : `Your ${
                    appointment.visit_type?.toLowerCase() || ''
                  } visit is scheduled.`
            }
          />
          {appointment?.status === 'Requested' ? (
            <Typography variant="body1">{`Select 'Confirm' below to confirm your visit.`}</Typography>
          ) : null}
        </Box>
        {appointment.provider && (
          <VisitSummary
            isConfirmed={appointment?.status === 'Confirmed'}
            appointment={appointment}
          />
        )}
        <Stack gap="1rem" sx={{ paddingBottom: isMobile ? '80px' : '10px' }}>
          <LoadingButton
            loading={Loading}
            onClick={
              appointment?.status === 'Confirmed'
                ? handleContinue
                : appointment?.duration !== 15
                ? handleContinue
                : handleScheduleProviderVisit
            }
          >
            {appointment?.status === 'Requested' ? 'Confirm' : 'Continue'}
          </LoadingButton>
          {appointment?.status !== 'Requested' ? (
            <Button color="grey" onClick={handleReschedule}>
              Reschedule
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Container>
  );
};

export const getServerSideProps = getAuthProps;

VisitConfirmation.getLayout = (page: ReactElement) => (
  <PatientPortalNav>{page}</PatientPortalNav>
);

export default VisitConfirmation;
