import WeightFullBodyVerification from '@/components/screens/WeightFullBodyVerification';
import Footer from '@/components/shared/layout/Footer';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import { getAuthProps } from '@/lib/auth';
import Container from '@mui/material/Container';
import Head from 'next/head';
import { ReactElement } from 'react';

const WeightFullBodyVerificationPage = () => {
  return (
    <>
      <Head>
        <title>Weight Loss Lessons | Zealthy</title>
      </Head>
      <Container sx={{ maxWidth: '450px !important' }}>
        <WeightFullBodyVerification />
      </Container>

      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

WeightFullBodyVerificationPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default WeightFullBodyVerificationPage;
