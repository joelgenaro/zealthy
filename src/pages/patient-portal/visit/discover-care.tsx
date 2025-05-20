import Head from 'next/head';
import { ReactElement } from 'react';
import { getAuthProps } from '@/lib/auth';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import Footer from '@/components/shared/layout/Footer';
import DiscoverCare from '@/components/screens/DiscoverCare';

const DiscoverCarePage = () => {
  return (
    <>
      <Head>
        <title>Discover care | Zealthy</title>
      </Head>
      <DiscoverCare />
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

DiscoverCarePage.getLayout = (page: ReactElement) => (
  <PatientPortalNav>{page}</PatientPortalNav>
);

export default DiscoverCarePage;
