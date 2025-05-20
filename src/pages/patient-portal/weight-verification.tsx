import Head from 'next/head';
import { getAuthProps } from '@/lib/auth';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import Footer from '@/components/shared/layout/Footer';
import Container from '@mui/material/Container';
import WeightVerification from '@/components/screens/WeightVerification';

const WeightVerificationPage = () => {
  return (
    <>
      <Head>
        <title>Weight Loss Lessons | Zealthy</title>
      </Head>
      <Container sx={{ maxWidth: '450px !important' }}>
        <WeightVerification />
      </Container>

      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

WeightVerificationPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default WeightVerificationPage;
