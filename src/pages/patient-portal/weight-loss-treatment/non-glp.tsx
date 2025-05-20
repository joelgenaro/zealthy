import { Container } from '@mui/material';
import { getAuthProps } from '@/lib/auth';
import Head from 'next/head';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import Footer from '@/components/shared/layout/Footer';
import NonGLPWeightLossTreatment from '@/components/screens/NonGLPWeightLossTreatment';

const WeightLossTreatmentPage = () => {
  return (
    <>
      <Container maxWidth="sm">
        <Head>
          <title>Weight Loss Treatments</title>
        </Head>
        <NonGLPWeightLossTreatment />
      </Container>
      <Footer />
    </>
  );
};
export const getServerSideProps = getAuthProps;

WeightLossTreatmentPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default WeightLossTreatmentPage;
