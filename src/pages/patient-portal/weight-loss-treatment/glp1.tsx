import { Container } from '@mui/material';
import { getAuthProps } from '@/lib/auth';
import Head from 'next/head';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import Footer from '@/components/shared/layout/Footer';
import WeightLossGLP1Treatments from '@/components/screens/WeightLossGLP1Treatments';

const WeightLossTreatmentGLP1Page = () => {
  return (
    <>
      <Container maxWidth="sm">
        <Head>
          <title>Weight Loss Treatments</title>
        </Head>
        <WeightLossGLP1Treatments />
      </Container>
      <Footer />
    </>
  );
};
export const getServerSideProps = getAuthProps;

WeightLossTreatmentGLP1Page.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default WeightLossTreatmentGLP1Page;
