import Head from 'next/head';
import { getAuthProps } from '@/lib/auth';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import { User } from '@supabase/supabase-js';
import Gap from '@/components/shared/layout/Gap';
import ManagePrescriptionPlan from '@/components/screens/Prescriptions/ManagePrescriptionPlan';
import { Container } from '@mui/material';

interface SessionUserProps {
  sessionUser: User;
}
const Subscription = ({ sessionUser }: SessionUserProps) => {
  return (
    <>
      <Head>
        <title>Subscription details | Zealthy</title>
      </Head>
      <Container maxWidth="md">
        <ManagePrescriptionPlan sessionUser={sessionUser} />
        <Gap />
      </Container>
    </>
  );
};

export const getServerSideProps = getAuthProps;

Subscription.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default Subscription;
