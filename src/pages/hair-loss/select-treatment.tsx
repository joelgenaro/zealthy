import OnboardingLayout from '@/layouts/OnboardingLayout';
import Head from 'next/head';
import { ReactElement, useEffect } from 'react';

import { getAuthProps } from '@/lib/auth';
import HairLossTreatmentScreen from '@/components/screens/HairLossTreatmentScreen';
import Container from '@mui/material/Container';
import { useSelector } from '@/components/hooks/useSelector';
import { useRouter } from 'next/router';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import React from 'react';
import getConfig from '../../../config';

const HairLossTreatment = () => {
  const visitId = useSelector(store => store.visit.id);
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  useEffect(() => {
    if (!visitId) {
      router.replace(
        `/onboarding/${
          ['Zealthy', 'FitRx'].includes(siteName ?? '')
            ? 'region-screen'
            : 'region-screen-2'
        }?care=Hair+loss&variant=0&ins=`
      );
    } else {
      setIsLoading(false);
    }
  }, [visitId, router]);
  const isMobile = useIsMobile();

  if (isLoading) {
    return <></>;
  }

  return (
    <>
      <Head>
        <title>Zealthy | Hair loss Treatment</title>
      </Head>
      <Container sx={{ maxWidth: '968px !important' }}>
        <HairLossTreatmentScreen />
      </Container>
    </>
  );
};

export const getServerSideProps = getAuthProps;

HairLossTreatment.getLayout = (page: ReactElement) => {
  return <OnboardingLayout>{page}</OnboardingLayout>;
};

export default HairLossTreatment;
