import Head from 'next/head';
import { Container } from '@mui/material';
import { ReactElement } from 'react';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { getAuthProps } from '@/lib/auth';
import { Pathnames } from '@/types/pathnames';
import PaymentAddOn from '@/components/screens/PaymentAddOn';
import getConfig from '../../../config';

const siteName = getConfig(
  process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
).name;

const PaymentAddOnPage = () => {
  return (
    <>
      <Head>
        <title>Zealthy | Onboarding | Payment add-on</title>
      </Head>
      <Container maxWidth="xs">
        <PaymentAddOn />
      </Container>
    </>
  );
};

export const getServerSideProps = getAuthProps;

PaymentAddOnPage.getLayout = (page: ReactElement) => (
  <OnboardingLayout
    back={
      siteName === 'Zealthy' || siteName === 'FitRx'
        ? Pathnames.REGION_SCREEN
        : Pathnames.REGION_SCREEN_ZP
    }
  >
    {page}
  </OnboardingLayout>
);

export default PaymentAddOnPage;
