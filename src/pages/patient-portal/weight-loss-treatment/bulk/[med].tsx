import { Container } from '@mui/material';
import { getAuthProps } from '@/lib/auth';
import Head from 'next/head';
import WeightLossBulkTreatment from '@/components/screens/WeightLossBulkTreatment';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import Footer from '@/components/shared/layout/Footer';

const WeightLossBulkTreatmentPage = () => {
  return (
    <>
      <Container maxWidth="sm">
        <Head>
          <title>Weight Loss Bulk Treatments</title>
        </Head>
        <WeightLossBulkTreatment />
      </Container>
      <Footer />
    </>
  );
};
export const getServerSideProps = getAuthProps;

WeightLossBulkTreatmentPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default WeightLossBulkTreatmentPage;
