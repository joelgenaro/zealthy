import Head from 'next/head';
import { ReactElement } from 'react';

import InsuranceForm from '@/components/screens/InsuranceForm';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { getAuthProps } from '@/lib/auth';
import { useIntakeState } from '@/components/hooks/useIntake';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';

const InsuranceInput = () => {
  const { potentialInsurance } = useIntakeState();
  const insuranceAcceptedV2 =
    potentialInsurance == PotentialInsuranceOption.OUT_OF_NETWORK_V2;

  return (
    <>
      <Head>
        <title>Insurance Form | Onboarding | Zealthy</title>
      </Head>
      <InsuranceForm
        title={
          insuranceAcceptedV2
            ? 'Enter your insurance details here.'
            : 'Now provide Zealthy with your insurance information.'
        }
        description={
          insuranceAcceptedV2
            ? 'Your insurance may pay for your visit at Zealthy.'
            : 'This will only take a minute of your time. Please enter your insurance card details manually below.'
        }
      />
    </>
  );
};

export const getServerSideProps = getAuthProps;

InsuranceInput.getLayout = (page: ReactElement) => (
  <OnboardingLayout>{page}</OnboardingLayout>
);

export default InsuranceInput;
