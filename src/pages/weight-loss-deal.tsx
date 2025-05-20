import Head from 'next/head';
import { ReactElement } from 'react';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import WeightLossDeal from '@/components/screens/Checkout/components/WeightLossDeal';

const WhatIsNext = () => (
  <>
    <Head>
      <title>{`Weight Loss Ohio Deal | Zealthy`}</title>
    </Head>
    <WeightLossDeal />
  </>
);

WhatIsNext.getLayout = (page: ReactElement) => (
  <OnboardingLayout>{page}</OnboardingLayout>
);

export default WhatIsNext;
