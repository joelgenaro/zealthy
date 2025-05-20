import Head from 'next/head';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import { getAuthProps } from '@/lib/auth';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import { CoachingAddOn } from '@/components/shared/AddOnPayment';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import Footer from '@/components/shared/layout/Footer';
import { usePatient, usePatientPayment } from '@/components/hooks/data';
import { useSelector } from '@/components/hooks/useSelector';
import axios from 'axios';
import {
  useAppointmentAsync,
  useAppointmentSelect,
} from '@/components/hooks/useAppointment';
import { useIntakeState } from '@/components/hooks/useIntake';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import isEmpty from 'lodash/isEmpty';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';

const VisitAddOnPage = () => {
  const { data: patientInfo } = usePatient();
  const { data: patientPayment } = usePatientPayment();
  const { specificCare } = useIntakeState();
  const coaching = useSelector(store => store.coaching[0]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const supabase = useSupabaseClient<Database>();

  const appointment = useAppointmentSelect(appointments =>
    appointments.find(a =>
      ['Coach (Mental Health)', 'Coach (Weight Loss)'].includes(
        a.appointment_type
      )
    )
  );
  const { updateAppointment } = useAppointmentAsync();

  const handleScheduledAppointment = async () => {
    setLoading(true);

    updateAppointment(
      appointment!.id,
      {
        status: 'Confirmed',
      },
      patientInfo!
    )
      .then(() => {
        setLoading(false);
        Router.push(`${Pathnames.PATIENT_PORTAL}`);
      })
      .catch(error => {
        setLoading(false);
        console.error('handleScheduleAppt_err', error);
      });
  };

  const onContinue = () => {
    Router.push(Pathnames.PATIENT_PORTAL);
  };

  const next = useCallback(() => {
    if (appointment?.appointment_type === 'Coach (Mental Health)') {
      Router.push(Pathnames.PATIENT_PORTAL);
    }
  }, [appointment]);

  async function handlePurchaseCoachingPlan() {
    setLoading(true);
    const params = {
      patient: { id: patientInfo?.id },
      coaching: {
        id: coaching?.id,
        planId: coaching?.planId,
        require_payment_now: true,
        name: coaching.name,
        price: coaching.discounted_price || coaching.price,
        type: coaching.type,
      },
    };

    await axios.post('/api/service/payment/addon', params).then(() => {
      if (coaching.type === CoachingType.MENTAL_HEALTH) {
        handleScheduledAppointment();
      } else {
        next();
        setLoading(false);
      }
    });
  }

  useEffect(() => {
    if (!patientInfo?.id) {
      return;
    }
    async function fetchSubscription() {
      const { data } = await supabase
        .from('patient_subscription')
        .select('*, subscription(name)')
        .eq('status', 'active')
        .eq('patient_id', patientInfo?.id!)
        .eq('subscription_id', coaching?.id)
        .limit(1);
      return data;
    }

    fetchSubscription().then(subscription => {
      setHasSubscription(!isEmpty(subscription));
    });
  }, [patientInfo?.id, coaching?.id, supabase]);

  return (
    <>
      <Head>
        <title>Schedule Visit | Zealthy</title>
      </Head>
      <CoachingAddOn
        plan={coaching}
        patientPayment={patientPayment!}
        onSubmit={handlePurchaseCoachingPlan}
        onBack={onContinue}
        loading={loading}
        hasSubscription={hasSubscription}
        onNext={next}
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
