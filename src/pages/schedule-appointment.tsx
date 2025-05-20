import Head from 'next/head';
import { ReactElement, useEffect, useState } from 'react';
import { Stack } from '@mui/material';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import ScheduleAppointment from '@/components/screens/ScheduleAppointment';
import { getAuthProps } from '@/lib/auth';
import Router from 'next/router';
import {
  usePsychiatryAppointments,
  useLastAppointment,
} from '@/components/hooks/data';
import { useRouter } from 'next/router';
import { APPOINTMENT_QUERY } from '@/context/AppContext/query';
import {
  AppointmentPayload,
  AppointmentState,
} from '@/context/AppContext/reducers/types/appointment';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { mapPayloadToAppointment } from '@/context/AppContext/utils/mapPayloadToAppointment';
import Loading from '@/components/shared/Loading/Loading';

const ScheduleAppointmentHome = () => {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const { 'appt-id': apptId } = router.query;
  const { data: appointments } = usePsychiatryAppointments();
  const { data: lastAppointment } = useLastAppointment('Anxiety or depression');
  const [appointment, setAppointment] = useState<AppointmentState | null>(null);
  const [loading, setLoading] = useState(true);
  const first = appointments?.[0]?.status === 'Noshowed';
  const second = appointments?.[1]?.status === 'Noshowed';

  useEffect(() => {
    if (!apptId) {
      setLoading(false);
      return;
    }

    const fetchAppointment = async () => {
      const { data } = await supabase
        .from('appointment')
        .select(APPOINTMENT_QUERY)
        .eq('id', apptId)
        .single();

      if (data) {
        setAppointment(mapPayloadToAppointment(data as AppointmentPayload));
      }
      setLoading(false);
    };

    fetchAppointment();
  }, [apptId, supabase]);

  useEffect(() => {
    if (!appointment) return;

    if (lastAppointment?.status === 'Confirmed') return;
    else if (
      appointment.appointment_type === 'Provider' &&
      (lastAppointment?.status === 'Cancelled' || (first && !second))
    ) {
      Router.push('/patient-portal/schedule-psychiatry');
    } else if (appointment.appointment_type === 'Provider' && first && second) {
      Router.push('/patient-portal/mental-health/visit-not-due');
    }
  }, [appointment, lastAppointment, first, second]);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <title>Zealthy</title>
      </Head>
      <Stack textAlign="center" alignItems="center" spacing={4}>
        <ScheduleAppointment />
      </Stack>
    </>
  );
};

export const getServerSideProps = getAuthProps;

ScheduleAppointmentHome.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default ScheduleAppointmentHome;
