import Head from 'next/head';
import { ReactElement } from 'react';

import OnboardingLayout from '@/layouts/OnboardingLayout';
import InsuranceCapture from '@/components/screens/InsuranceCapture';
import { getAuthProps } from '@/lib/auth';

const InsuranceCapturePage = () => {
  return (
    <>
      <Head>
        <title>Insurance Capture | Onboarding | Zealthy</title>
      </Head>
      <InsuranceCapture />
    </>
  );
};

export const getServerSideProps = getAuthProps;

InsuranceCapturePage.getLayout = (page: ReactElement) => (
  <OnboardingLayout>{page}</OnboardingLayout>
);

export default InsuranceCapturePage;
