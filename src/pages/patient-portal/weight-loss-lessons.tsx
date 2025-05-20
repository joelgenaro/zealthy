import Head from 'next/head';
import { getAuthProps } from '@/lib/auth';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import Footer from '@/components/shared/layout/Footer';
import WeightLossLessons from '@/components/screens/WeightLossLessons';

const WeightLossLessonsPage = () => {
  return (
    <>
      <Head>
        <title>Weight Loss Lessons | Zealthy</title>
      </Head>
      <WeightLossLessons />
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

WeightLossLessonsPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default WeightLossLessonsPage;
