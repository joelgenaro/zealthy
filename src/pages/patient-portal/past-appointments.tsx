import { ReactElement } from 'react';
import { Container } from '@mui/material';
import { getAuthProps } from '@/lib/auth';
import Head from 'next/head';
import PastAppointmentsDetail from '@/components/screens/PastAppointments';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import Footer from '@/components/shared/layout/Footer';

const PastAppointments = () => {
  return (
    <>
      <Container maxWidth="xs">
        <Head>
          <title>Past appointments</title>
        </Head>
        <PastAppointmentsDetail />
      </Container>
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

PastAppointments.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default PastAppointments;
