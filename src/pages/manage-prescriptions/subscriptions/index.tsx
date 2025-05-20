import Head from 'next/head';
import { getAuthProps } from '@/lib/auth';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import SubscriptionContent from '@/components/screens/Prescriptions/SubscriptionContent';
import { User } from '@supabase/supabase-js';
import Footer from '@/components/shared/layout/Footer';

interface SessionUserProps {
  sessionUser: User;
}
const Subscriptions = ({ sessionUser }: SessionUserProps) => {
  return (
    <>
      <Head>
        <title>Medication subscriptions | Zealthy</title>
      </Head>
      <CenteredContainer maxWidth="sm">
        <SubscriptionContent sessionUser={sessionUser} />
        <Footer />
      </CenteredContainer>
    </>
  );
};

export const getServerSideProps = getAuthProps;

Subscriptions.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default Subscriptions;
