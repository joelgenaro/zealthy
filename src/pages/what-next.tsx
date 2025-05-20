import Head from 'next/head';
import { ReactElement } from 'react';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import WhatToExpect from '@/components/screens/Checkout/components/WhatToExpect';
import getConfig from '../../config';

const siteName = getConfig(
  process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
).name;

const WhatIsNext = () => (
  <Head>
    <title>{`What's next? | ${siteName}`}</title>
    <WhatToExpect />
  </Head>
);

WhatIsNext.getLayout = (page: ReactElement) => (
  <OnboardingLayout>
    <WhatToExpect />
  </OnboardingLayout>
);

export default WhatIsNext;
