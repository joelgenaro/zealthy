import Head from 'next/head';
import { ReactElement } from 'react';
import { Container } from '@mui/material';
import { getAuthProps } from '@/lib/auth';
import Footer from '@/components/shared/layout/Footer';
import BloodPressure from '@/components/screens/BloodPressure';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';

const BloodPressurePage = () => {
  return (
    <Container maxWidth="sm">
      <Head>
        <title>Blood Pressure | Vitals | My Health | Zealthy</title>
      </Head>
      <BloodPressure />
      <Footer />
    </Container>
  );
};
export const getServerSideProps = getAuthProps;

BloodPressurePage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default BloodPressurePage;
