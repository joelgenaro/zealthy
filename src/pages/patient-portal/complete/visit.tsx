import Head from 'next/head';
import { ReactElement, useEffect, useState } from 'react';
import { getAuthProps } from '@/lib/auth';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import { ProviderAddOn } from '@/components/shared/AddOnPayment';
import {
  useAppointmentAsync,
  useAppointmentSelect,
} from '@/components/hooks/useAppointment';
import Router, { useRouter } from 'next/router';
import { Pathnames } from '@/types/pathnames';
import Footer from '@/components/shared/layout/Footer';
import { usePatient } from '@/components/hooks/data';
import { useSelector } from '@/components/hooks/useSelector';
import { useFlowState } from '@/components/hooks/useFlow';

const VisitAddOnPage = () => {
  const { data: patient } = usePatient();
  const appointment = useAppointmentSelect(appointments =>
    appointments.find(a => a.appointment_type === 'Provider')
  );
  const { updateAppointment } = useAppointmentAsync();
  const coaching = useSelector(store => store.coaching);
  const [loading, setLoading] = useState<boolean>(false);

  const handleScheduledAppointment = async () => {
    setLoading(true);
    updateAppointment(
      appointment!.id,
      {
        status: 'Confirmed',
      },
      patient!
    )
      .then(() => {
        setLoading(false);
        if (coaching.length > 0) {
          Router.push(Pathnames.PATIENT_PORTAL_ADD_ON_COACH);
        } else {
          Router.push(Pathnames.PATIENT_PORTAL);
        }
      })
      .catch(error => {
        setLoading(false);
        console.error('handleScheduleAppointment_err', error);
      });
  };

  return (
    <>
      <Head>
        <title>Schedule Visit | Zealthy</title>
      </Head>
      <ProviderAddOn
        appointment={appointment as any}
        patient={{ id: patient?.id }}
        onSubmit={handleScheduledAppointment}
        onBack={() => Router.push(Pathnames.PATIENT_PORTAL_SCHEDULE_VISIT)}
        loading={loading}
      />
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

VisitAddOnPage.getLayout = (page: ReactElement) => (
  <PatientPortalNav>{page}</PatientPortalNav>
);

export default VisitAddOnPage;
