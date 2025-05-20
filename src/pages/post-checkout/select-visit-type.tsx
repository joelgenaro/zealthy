import Head from 'next/head';
import Router from 'next/router';
import { ReactElement } from 'react';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import Title from '@/components/shared/Title';
import { Button, Container, Stack, Typography } from '@mui/material';
import BaseCard from '@/components/shared/BaseCard';
import VideoVisitIcon from '@/components/shared/icons/VideoVisitIcon';
import PhoneVisitIcon from '@/components/shared/icons/PhoneVisitIcon';
import { getAuthProps } from '@/lib/auth';
import {
  useAppointmentAsync,
  useAppointmentSelect,
} from '@/components/hooks/useAppointment';
import { Database } from '@/lib/database.types';
import { usePostCheckoutNavigation } from '@/context/NavigationContext/NavigationContext';
import { usePatient } from '@/components/hooks/data';

type VisitType = Database['public']['Enums']['visit_type'];

const VisitTypeSelection = () => {
  const { data: patient } = usePatient();
  const { next } = usePostCheckoutNavigation();
  const appointment = useAppointmentSelect(appointments =>
    appointments.find(a => a.appointment_type === 'Provider')
  );
  const { updateAppointment } = useAppointmentAsync();

  const onContinue = async (visitType: VisitType) => {
    await updateAppointment(
      appointment!.id,
      { visit_type: visitType },
      patient!
    );
    Router.push(next);
  };

  if (!appointment) {
    return null;
  }

  return (
    <Container>
      <Head>
        <title>Video or phone visit? | Zealthy</title>
      </Head>
      <Stack gap="3rem" maxWidth="448px" margin="0 auto">
        <Title text="Would you prefer a video visit or phone consult?" />
        <BaseCard>
          <Stack gap="1rem" width="100%" alignItems="center" padding="2rem">
            <VideoVisitIcon />
            {appointment?.provider && (
              <Typography>
                {`Keep your video visit with Dr. ${appointment.provider.first_name} ${appointment.provider.last_name}.`}
              </Typography>
            )}
            <Button
              size="medium"
              onClick={() => onContinue('Video')}
              sx={{ width: '100%' }}
            >
              I prefer video
            </Button>
          </Stack>
        </BaseCard>
        <BaseCard>
          <Stack gap="1rem" width="100%" alignItems="center" padding="2rem">
            <PhoneVisitIcon />
            {appointment?.provider && (
              <Typography>
                {`Speak to Dr. ${appointment.provider.first_name} ${appointment.provider.last_name} over the phone.`}
              </Typography>
            )}
            <Button
              size="medium"
              onClick={() => onContinue('Phone')}
              sx={{ width: '100%' }}
            >
              I prefer phone
            </Button>
          </Stack>
        </BaseCard>
      </Stack>
    </Container>
  );
};

export const getServerSideProps = getAuthProps;

VisitTypeSelection.getLayout = (page: ReactElement) => (
  <OnboardingLayout>{page}</OnboardingLayout>
);

export default VisitTypeSelection;
