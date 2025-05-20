import Head from 'next/head';
import { ReactElement, useState } from 'react';
import { getAuthProps } from '@/lib/auth';
import OneTimeScheduleVisit from '@/components/screens/OneTimeScheduleVisit';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import { Box, Stack, Typography } from '@mui/material';
import Router, { useRouter } from 'next/router';
import {
  useAppointmentAsync,
  useAppointmentSelect,
} from '@/components/hooks/useAppointment';
import VisitSummary from '@/components/shared/VisitSummary';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { usePatient } from '@/components/hooks/data';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { AxiosError, isAxiosError } from 'axios';
import { Pathnames } from '@/types/pathnames';
import { toast } from 'react-hot-toast';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { format } from 'date-fns';

const ScheduleNowPage = () => {
  const supabase = useSupabaseClient<Database>();
  const { query } = useRouter();
  const { data: patient } = usePatient();
  const [scheduling, setScheduling] = useState(false);
  const { updateAppointment } = useAppointmentAsync();
  const appointment = useAppointmentSelect(appointments =>
    appointments.find(a => a.appointment_type === 'Provider')
  );

  async function handleScheduledAppointment() {
    setScheduling(true);
    if (!appointment) {
      setScheduling(false);
      return;
    }
    updateAppointment(
      appointment.id,
      {
        status: 'Confirmed',
        care: SpecificCareOption.WEIGHT_LOSS,
        paid: true,
        payer_name: null,
      },
      patient!
    )
      .then(async () => {
        await supabase.from('single_use_appointment').insert({
          patient: patient?.id,
          clinician: appointment?.provider?.id!,
          used: true,
          used_on: format(new Date(), 'yyyy-MM-dd'),
        });
        await supabase
          .from('prescription_request')
          .update({
            care_team: [appointment?.provider?.id!],
          })
          .eq('patient_id', patient?.id!)
          .eq('status', 'REQUESTED');
      })
      .then(() => {
        toast.success('Appointment scheduled successfully');
        Router.push(Pathnames.PATIENT_PORTAL);
      })
      .catch(error => {
        setScheduling(false);
        if (isAxiosError(error)) {
          const status = (error as AxiosError).response?.status;
          if (status === 422) {
            Router.back();
          }
        }
      });
  }

  return (
    <>
      <Head>
        <title>Schedule Visit | Zealthy</title>
      </Head>
      <Box alignItems="center">
        {query.page === 'confirm' ? (
          <Stack gap="3rem" maxWidth="500px" margin="0 auto">
            <Stack gap="1rem">
              <Typography variant="h2">Confirm your visit selection</Typography>
              {appointment && appointment.provider && (
                <VisitSummary isConfirmed={false} appointment={appointment} />
              )}
            </Stack>
            <LoadingButton
              loading={scheduling}
              size="large"
              onClick={() => handleScheduledAppointment()}
            >
              Schedule now
            </LoadingButton>
          </Stack>
        ) : (
          <OneTimeScheduleVisit duration={15} />
        )}
      </Box>
    </>
  );
};

export const getServerSideProps = getAuthProps;

ScheduleNowPage.getLayout = (page: ReactElement) => (
  <DefaultNavLayout>{page}</DefaultNavLayout>
);

export default ScheduleNowPage;
