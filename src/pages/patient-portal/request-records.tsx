import { ReactElement } from 'react';
import { Container } from '@mui/material';
import { getAuthProps } from '@/lib/auth';
import Head from 'next/head';
import RequestRecordsDetail from '@/components/screens/RequestRecords';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import Footer from '@/components/shared/layout/Footer';

const RequestRecords = () => {
  return (
    <>
      <Container maxWidth="sm">
        <Head>
          <title>Request Records</title>
        </Head>
        <RequestRecordsDetail />
      </Container>
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

RequestRecords.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default RequestRecords;
