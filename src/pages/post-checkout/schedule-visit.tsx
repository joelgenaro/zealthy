import Head from 'next/head';
import { ReactElement } from 'react';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { getAuthProps } from '@/lib/auth';

import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';
import ZealthyProviderSchedule from '@/components/screens/Question/components/ZealthyProviderSchedule';

const SchedulePostCheckoutVisitPage = () => {
  return (
    <>
      <Head>
        <title>Schedule Visit | Zealthy</title>
      </Head>
      <ZealthyProviderSchedule
        onSelect={() => Router.push(Pathnames.POST_CHECKOUT_UPDATE_INTAKES)}
      />
    </>
  );
};

export const getServerSideProps = getAuthProps;

SchedulePostCheckoutVisitPage.getLayout = (page: ReactElement) => (
  <OnboardingLayout>{page}</OnboardingLayout>
);

export default SchedulePostCheckoutVisitPage;
