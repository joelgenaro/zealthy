import Head from 'next/head';
import Router, { useRouter } from 'next/router';
import { ReactElement, useEffect, useMemo } from 'react';
import Loading from '@/components/shared/Loading/Loading';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { Pathnames } from '@/types/pathnames';
import {
  useAppointmentAsync,
  useAppointmentSelect,
} from '@/components/hooks/useAppointment';

import { useInsuranceState } from '@/components/hooks/useInsurance';
import { AxiosError, isAxiosError } from 'axios';
import { lessThan24hours } from '@/utils/date-fns';
import { getPostCheckoutAuth } from '@/lib/auth';
import { usePatient } from '@/components/hooks/data';
import getConfig from '../../../config';

const ScheduleAppointment = () => {
  const { query } = useRouter();
  const { data: patient } = usePatient();
  const appointment = useAppointmentSelect(appointments =>
    appointments.find(a => a.appointment_type === 'Provider')
  );

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  const nextPage = (query.next as string) || Pathnames.CHECKOUT_CREATE_INTAKE;

  const { updateAppointment } = useAppointmentAsync();
  const { member_id, payer } = useInsuranceState();

  const paymentIsRequired = useMemo(
    () =>
      appointment &&
      (appointment.encounter_type === 'Walked-in' ||
        lessThan24hours(appointment.starts_at!) ||
        [
          'Psychiatric',
          'Anxiety or depression',
          '1:1 with Coach (Mental Health)',
          'Weight Loss',
          'Weight loss',
        ].some(e => appointment?.description?.includes(e))),
    [appointment]
  );

  useEffect(() => {
    if (!appointment || appointment?.status === 'Confirmed') {
      Router.push(nextPage);
      return;
    }

    // schedule appointment following successful payment
    const handleScheduledAppointment = async () => {
      updateAppointment(
        appointment.id,
        {
          status: 'Confirmed',
          paid: paymentIsRequired,
          payer_name: member_id && payer?.name ? payer.name : null,
        },
        patient!
      )
        .then(() => {
          return Router.replace(nextPage);
        })
        .catch(error => {
          if (isAxiosError(error)) {
            const status = (error as AxiosError).response?.status;
            if (status === 422) {
              updateAppointment(
                appointment.id,
                {
                  status: 'Rejected',
                  paid: paymentIsRequired,
                },
                patient!
              ).then(() => {
                Router.push(nextPage);
              });
            }
          }

          console.error('handleSchedApptmt_err', error);
        });
    };

    if (
      appointment.encounter_type === 'Scheduled' &&
      appointment.status === 'Requested'
    ) {
      handleScheduledAppointment();
      return;
    }

    throw new Error('Unknown appointment type');
  }, [
    appointment,
    member_id,
    nextPage,
    payer?.name,
    paymentIsRequired,
    updateAppointment,
  ]);

  return (
    <>
      <Head>
        <title>{siteName} Visit</title>
      </Head>
      <Loading />
    </>
  );
};

export const getServerSideProps = getPostCheckoutAuth;

ScheduleAppointment.getLayout = (page: ReactElement) => {
  return <OnboardingLayout>{page}</OnboardingLayout>;
};

export default ScheduleAppointment;
