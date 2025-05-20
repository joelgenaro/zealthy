import CreateSubscriptionsStripe from '@/components/screens/CreateSubscriptionsStripe';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { getPostCheckoutAuth } from '@/lib/auth';
import { Database } from '@/lib/database.types';
import Head from 'next/head';
import { ReactElement } from 'react';
import getConfig from '../../../config';

interface CreateSubscriptionsStripeProps {
  patient: Database['public']['Tables']['patient']['Row'];
  profile: Database['public']['Tables']['profiles']['Row'];
}

/**
 * @description we should not use react query here.
 * since we start sending all requests right a way and
 * react-query cannot guarantee that patient will exist on first render
 */

const CreateSubscriptionsStripeScreen = ({
  patient,
  profile,
}: CreateSubscriptionsStripeProps) => {
  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  return (
    <>
      <Head>
        <title>{siteName} Visit</title>
      </Head>
      <CreateSubscriptionsStripe patient={patient} profile={profile} />
    </>
  );
};

export const getServerSideProps = getPostCheckoutAuth;

CreateSubscriptionsStripeScreen.getLayout = (page: ReactElement) => {
  return <OnboardingLayout>{page}</OnboardingLayout>;
};

export default CreateSubscriptionsStripeScreen;
