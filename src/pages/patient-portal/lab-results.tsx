import { ReactElement } from 'react';
import { Container } from '@mui/material';
import { getAuthProps } from '@/lib/auth';
import Head from 'next/head';
import LabResultsDetail from '@/components/screens/LabResults';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import Footer from '@/components/shared/layout/Footer';

const LabResults = () => {
  return (
    <>
      <Container maxWidth="sm">
        <Head>
          <title>Lab Results</title>
        </Head>
        <LabResultsDetail />
      </Container>
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

LabResults.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default LabResults;
