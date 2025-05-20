import Head from 'next/head';
import { ReactElement, useState } from 'react';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { Button, Container, Link, Stack, Typography } from '@mui/material';
import VisitSummary from '@/components/shared/VisitSummary';
import { getAuthProps } from '@/lib/auth';
import {
  useAppointmentAsync,
  useAppointmentSelect,
} from '@/components/hooks/useAppointment';
import Router from 'next/router';
import { useInsuranceState } from '@/components/hooks/useInsurance';
import UpdatePhoneModal from '@/components/shared/UpdatePhoneModal';
import { Pathnames } from '@/types/pathnames';
import { useVisitSelect } from '@/components/hooks/useVisit';
import { usePatient } from '@/components/hooks/data';
import { useIntakeState } from '@/components/hooks/useIntake';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';

const VisitConfirmation = () => {
  const { data: patient } = usePatient();
  const { hasINInsurance } = useInsuranceState();
  const [open, setOpen] = useState(false);
  const questionnaires = useVisitSelect(visit => visit.questionnaires);
  const { updateAppointment } = useAppointmentAsync();
  const { potentialInsurance } = useIntakeState();
  const appointment = useAppointmentSelect(appointments =>
    appointments.find(a => a.appointment_type === 'Provider')
  );

  const handleContinue = () => {
    if (potentialInsurance === PotentialInsuranceOption.OUT_OF_NETWORK_V2) {
      Router.push(Pathnames.INSURANCE_CAPTURE);
    } else if (!!questionnaires.length) {
      Router.push(`${Pathnames.QUESTIONNAIRES}/${questionnaires[0].name}`);
    } else {
      Router.push(Pathnames.WHAT_NEXT);
    }
  };

  async function handleAppointmentUpdate() {
    await updateAppointment(appointment!.id, { visit_type: 'Phone' }, patient!);
    handleContinue();
  }

  // currently disabled for all users
  const showPhoneOption = false;

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
          <Typography variant="h2">We’re holding your visit!</Typography>
          {appointment.provider && (
            <VisitSummary isConfirmed={false} appointment={appointment} />
          )}
          {showPhoneOption ? (
            <Typography variant="body1">
              Continue to answer a few more questions to fully confirm your
              video visit. Prefer phone?{' '}
              <Link onClick={() => setOpen(true)} style={{ cursor: 'pointer' }}>
                Click here
              </Link>{' '}
              to confirm a phone visit instead of video.
            </Typography>
          ) : (
            <Typography variant="body1">
              Continue to answer a few more questions to fully confirm your
              video visit.
            </Typography>
          )}
        </Stack>
        <Button size="large" onClick={handleContinue}>
          Continue to confirm your visit
        </Button>
      </Stack>
      <UpdatePhoneModal
        open={open}
        setOpen={setOpen}
        onConfirm={handleAppointmentUpdate}
      />
    </Container>
  );
};

export const getServerSideProps = getAuthProps;

VisitConfirmation.getLayout = (page: ReactElement) => (
  <OnboardingLayout>{page}</OnboardingLayout>
);

export default VisitConfirmation;
