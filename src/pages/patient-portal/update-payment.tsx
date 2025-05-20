import { ReactElement } from 'react';
import { Container } from '@mui/material';
import { getAuthProps } from '@/lib/auth';
import Head from 'next/head';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import PaymentUpdate from '@/components/screens/Profile/components/PaymentUpdate';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import Footer from '@/components/shared/layout/Footer';
import { usePatient } from '@/components/hooks/data';

const UpdatePaymentPage = () => {
  const { data: patient } = usePatient();

  return (
    <>
      <Container>
        <Head>
          <title>Update Payment</title>
        </Head>
        <PaymentUpdate
          patient={patient}
          onCancel={() => {
            Router.push(Pathnames.PATIENT_PORTAL);
          }}
        />
      </Container>
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

UpdatePaymentPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default UpdatePaymentPage;
