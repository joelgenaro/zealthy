import { ReactElement, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { usePayment } from '@/components/hooks/usePayment';
import { useIntakeState } from '@/components/hooks/useIntake';
import { useSelector } from '@/components/hooks/useSelector';
import Loading from '@/components/shared/Loading/Loading';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { getPostCheckoutAuth } from '@/lib/auth';
import { Database } from '@/lib/database.types';
import { postCheckoutNavigation } from '@/utils/postCheckoutNavigation';
import getConfig from '../../../config';
import Head from 'next/head';
import Router from 'next/router';
import { useVWOVariationName } from '@/components/hooks/data';
import { QuestionnaireName } from '@/types/questionnaire';
import { envMapping } from '@/questionnaires';

type PatientSubscription =
  Database['public']['Tables']['patient_subscription']['Row'];

interface CompleteCheckoutProps {
  patient: Database['public']['Tables']['patient']['Row'];
  profile: Database['public']['Tables']['profiles']['Row'];
}

const CompleteCheckout = ({ patient, profile }: CompleteCheckoutProps) => {
  const intake = useSelector(store => store.visit.intakes[0]);
  const { specificCare } = useIntakeState();
  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;
  const supabase = useSupabaseClient<Database>();
  const payment = usePayment();

  const cleanDuplicateSubscriptions = async () => {
    if (!patient?.id) return;
    try {
      const { data, error } = await supabase
        .from('patient_subscription')
        .select('*')
        .eq('patient_id', patient.id)
        .eq('subscription_id', 4)
        .eq('price', 135)
        .eq('visible', true);

      if (error) {
        throw new Error(error.message || 'Error fetching subscriptions');
      }

      if (!data || data.length <= 1) {
        console.log('No duplicate subscriptions found');
        return;
      }

      const activeSubs = data.filter(sub => sub.status === 'active');
      let subscriptionToKeep: PatientSubscription;

      if (activeSubs.length > 0) {
        activeSubs.sort(
          (a, b) =>
            new Date(a.created_at || '').getTime() -
            new Date(b.created_at || '').getTime()
        );
        subscriptionToKeep = activeSubs[0];
      } else {
        data.sort(
          (a, b) =>
            new Date(a.created_at || '').getTime() -
            new Date(b.created_at || '').getTime()
        );
        subscriptionToKeep = data[0];
      }

      const duplicates = data.filter(
        sub => sub.reference_id !== subscriptionToKeep.reference_id
      );

      for (const sub of duplicates) {
        if (sub.status === 'canceled') {
          await supabase
            .from('patient_subscription')
            .update({ visible: false })
            .eq('reference_id', sub.reference_id);
        } else {
          const response = await payment.cancelSubscription(
            sub.reference_id!,
            'Duplicate subscription detected.'
          );
          if (response.data.error) {
            throw new Error(
              response.data.error.message || 'Cancellation failed.'
            );
          }
          await supabase
            .from('patient_subscription')
            .update({ visible: false })
            .eq('reference_id', sub.reference_id);
        }
      }
      console.log('Duplicate subscriptions canceled successfully.');
    } catch (err) {
      console.log(
        'Unexpected error while cleaning duplicate subscriptions:',
        err
      );
    }
  };

  useEffect(() => {
    const runCheckout = async () => {
      await cleanDuplicateSubscriptions();

      if (specificCare === SpecificCareOption.ASYNC_MENTAL_HEALTH) {
        window?.freshpaint?.track('amh-checkout-page-success', {
          email: profile?.email!,
          first_name: profile.first_name!,
          last_name: profile.last_name!,
          state: patient.region,
          birth_date: profile.birth_date,
          gender: profile.gender,
          phone: profile.phone_number,
        });
      }

      let nextPage = postCheckoutNavigation(intake);

      if (specificCare === 'Prep' && intake?.name === 'checkout-success') {
        nextPage = '/post-checkout/prep-complete';
      }
      if (specificCare === 'Sleep' && intake?.name === 'checkout-success') {
        nextPage = '/post-checkout/complete-visit';
      }
      if (
        specificCare === 'Weight Loss Free Consult' &&
        intake?.name === 'checkout-success'
      ) {
        nextPage = '/post-checkout/complete-visit';
      }
      if (
        specificCare === 'Sex + Hair' &&
        intake?.name === 'checkout-success'
      ) {
        nextPage = '/post-checkout/complete-visit';
      }

      Router.replace(nextPage);
    };

    runCheckout();
  }, [intake, specificCare, patient, profile, supabase, payment]);

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

CompleteCheckout.getLayout = (page: ReactElement) => {
  return <OnboardingLayout>{page}</OnboardingLayout>;
};

export default CompleteCheckout;
