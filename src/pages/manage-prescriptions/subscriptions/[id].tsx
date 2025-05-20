import Head from 'next/head';
import { getAuthProps } from '@/lib/auth';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import { User } from '@supabase/supabase-js';
import SubscriptionDetails from '@/components/screens/Prescriptions/SubscriptionDetails';
import Gap from '@/components/shared/layout/Gap';

interface SessionUserProps {
  sessionUser: User;
}
const Subscription = ({ sessionUser }: SessionUserProps) => {
  return (
    <>
      <Head>
        <title>Subscription details | Zealthy</title>
      </Head>
      <CenteredContainer maxWidth="sm">
        <SubscriptionDetails sessionUser={sessionUser} />
        <Gap />
      </CenteredContainer>
    </>
  );
};

export const getServerSideProps = getAuthProps;

Subscription.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default Subscription;
