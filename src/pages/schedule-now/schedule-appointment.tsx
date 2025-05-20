import Head from 'next/head';
import Router from 'next/router';
import { ReactElement, useEffect } from 'react';
import { AxiosError, isAxiosError } from 'axios';
import Loading from '@/components/shared/Loading/Loading';
import {
  useAppointmentAsync,
  useAppointmentSelect,
} from '@/components/hooks/useAppointment';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { getPostCheckoutAuth } from '@/lib/auth';
import { AppointmentState } from '@/context/AppContext/reducers/types/appointment';
import router from 'next/router';
import { Database } from '@/lib/database.types';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import { usePatient } from '@/components/hooks/data';
import { format } from 'date-fns';

const ScheduleAppointment = () => {
  const { id } = router.query;
  const { data: patient } = usePatient();
  const supabase = useSupabaseClient<Database>();

  const { updateAppointment } = useAppointmentAsync();
  const appointment = useAppointmentSelect(appointments =>
    appointments.find(a => a.appointment_type === 'Provider')
  );

  const handleScheduledAppointment = async (appointment: AppointmentState) => {
    updateAppointment(
      appointment.id,
      {
        status: 'Confirmed',
        paid: true,
        payer_name: null,
      },
      patient!
    )
      .then(() =>
        supabase
          .from('single_use_appointment')
          .update({
            used: true,
            used_on: format(new Date(), 'yyyy-MM-dd'),
          })
          .eq('id', id!)
      )
      .then(() => Router.replace('/schedule-now/success'))
      .catch(error => {
        if (isAxiosError(error)) {
          const status = (error as AxiosError).response?.status;
          if (status === 422) {
            Router.replace('/schedule-now/' + id);
          }
        }

        console.error(error);
      });
  };

  useEffect(() => {
    if (appointment && appointment.status === 'Requested') {
      handleScheduledAppointment(appointment);
      return;
    }
  }, [appointment]);

  return (
    <>
      <Head>
        <title>Scheduling Appointment | Zealthy</title>
      </Head>
      <Loading />
    </>
  );
};

export const getServerSideProps = getPostCheckoutAuth;

ScheduleAppointment.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default ScheduleAppointment;
