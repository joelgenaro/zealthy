import Head from 'next/head';
import { getAuthProps } from '@/lib/auth';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import Footer from '@/components/shared/layout/Footer';
import WegovyNearYou from '@/components/screens/WegovyNearYou';

const WegovyNearYouPage = () => {
  return (
    <>
      <Head>
        <title>Weight Loss Wegovy Near You | Zealthy</title>
      </Head>
      <WegovyNearYou />
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

WegovyNearYouPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default WegovyNearYouPage;
