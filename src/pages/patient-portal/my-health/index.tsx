import { Container } from '@mui/material';
import { getPatientPortalProps, PatientSubscriptionProps } from '@/lib/auth';
import Head from 'next/head';
import HomeDetail from '@/components/screens/Home';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import Footer from '@/components/shared/layout/Footer';
import { Database } from '@/lib/database.types';

type Props = {
  visibleSubscriptions: PatientSubscriptionProps[];
  patient: Database['public']['Tables']['patient']['Row'];
};

const MyHealth = (props: Props) => {
  return (
    <Container maxWidth="sm">
      <Head>
        <title>My Health | Zealthy</title>
      </Head>

      <HomeDetail {...props} />
      <Footer />
    </Container>
  );
};
export const getServerSideProps = getPatientPortalProps;

MyHealth.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default MyHealth;
