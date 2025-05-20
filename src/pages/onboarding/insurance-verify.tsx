import Head from 'next/head';
import { ReactElement } from 'react';
import InsuranceForm from '@/components/screens/InsuranceForm';
import OnboardingLayout from '@/layouts/OnboardingLayout';

const VerifyInsuranceInput = () => {
  return (
    <>
      <Head>
        <title>Verify Insurance | Onboarding | Zealthy</title>
      </Head>
      <InsuranceForm
        title="Double-check your captured insurance info."
        description="This will only take a minute of your time."
      />
    </>
  );
};

VerifyInsuranceInput.getLayout = (page: ReactElement) => (
  <OnboardingLayout>{page}</OnboardingLayout>
);

export default VerifyInsuranceInput;
