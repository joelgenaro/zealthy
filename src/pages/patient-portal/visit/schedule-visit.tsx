import Head from 'next/head';
import { ReactElement } from 'react';
import ScheduleVisit from '@/components/screens/PatientPortal/components/ScheduleVisit';
import { getAuthProps } from '@/lib/auth';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import Footer from '@/components/shared/layout/Footer';

const ScheduleVisitPage = () => {
  return (
    <>
      <Head>
        <title>Schedule Visit | Zealthy</title>
      </Head>
      <ScheduleVisit />
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

ScheduleVisitPage.getLayout = (page: ReactElement) => (
  <PatientPortalNav>{page}</PatientPortalNav>
);

export default ScheduleVisitPage;
