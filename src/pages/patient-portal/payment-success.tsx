import { Container } from '@mui/material';
import { getAuthProps } from '@/lib/auth';
import Head from 'next/head';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement, useEffect } from 'react';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import Loading from '@/components/shared/Loading/Loading';

const PaymentSuccessPortalPage = () => {
  useEffect(() => {
    // Prevent navigating back using browser's back button
    const handlePopstate = () => {
      // Revert the navigation attempt by going forward again
      window.history.forward();
    };

    // Attach the event listener when the component mounts
    window.addEventListener('popstate', handlePopstate);
    Router.push(Pathnames.PATIENT_PORTAL);
    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, []);

  return (
    <Container maxWidth="sm">
      <Head>
        <title>Payment Success</title>
      </Head>
      <Loading />
    </Container>
  );
};
export const getServerSideProps = getAuthProps;

PaymentSuccessPortalPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default PaymentSuccessPortalPage;
