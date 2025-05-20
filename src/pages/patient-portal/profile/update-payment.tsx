import Head from 'next/head';
import { ReactElement } from 'react';
import { Container } from '@mui/material';
import { getAuthProps } from '@/lib/auth';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import PaymentUpdate from '@/components/screens/Profile/components/PaymentUpdate';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import { usePatient } from '@/components/hooks/data';

const ProfileHome = () => {
  const { data: patient } = usePatient();

  return (
    <>
      <Head>
        <title>Update payment method | Zealthy</title>
      </Head>
      <Container>
        <PaymentUpdate
          patient={patient}
          onCancel={() => {
            Router.push(Pathnames.PATIENT_PORTAL_PROFILE);
          }}
        />
      </Container>
    </>
  );
};

export const getServerSideProps = getAuthProps;

ProfileHome.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default ProfileHome;
