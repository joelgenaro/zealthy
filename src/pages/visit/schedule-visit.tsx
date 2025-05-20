import Head from 'next/head';
import { ReactElement } from 'react';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import ScheduleVisit from '@/components/screens/ScheduleVisit';
import { getAuthProps } from '@/lib/auth';

const ScheduleVisitPage = () => {
  return (
    <>
      <Head>
        <title>Schedule Visit | Zealthy</title>
      </Head>
      <ScheduleVisit />
    </>
  );
};

export const getServerSideProps = getAuthProps;

ScheduleVisitPage.getLayout = (page: ReactElement) => (
  <OnboardingLayout>{page}</OnboardingLayout>
);

export default ScheduleVisitPage;
