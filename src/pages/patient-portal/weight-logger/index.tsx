import Head from 'next/head';
import { getAuthProps } from '@/lib/auth';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import WeightLogger from '@/components/screens/WeightLogger';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import Footer from '@/components/shared/layout/Footer';

const WeightLoggerPage = () => {
  return (
    <>
      <Head>
        <title>Zealthy | Weight Logger</title>
      </Head>
      <CenteredContainer maxWidth="sm">
        <WeightLogger />
      </CenteredContainer>
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

WeightLoggerPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default WeightLoggerPage;
