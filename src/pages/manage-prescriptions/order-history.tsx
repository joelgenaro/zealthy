import Head from 'next/head';
import { getAuthProps } from '@/lib/auth';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import OrderHistoryContent from '@/components/screens/Prescriptions/OrderHistoryContent';
import { User } from '@supabase/supabase-js';

interface SessionUserProps {
  sessionUser: User;
}
const OrderHistory = ({ sessionUser }: SessionUserProps) => {
  return (
    <>
      <Head>
        <title>Zealthy | Medication, Prescription Renewals & Delivery</title>
      </Head>
      <CenteredContainer maxWidth="sm">
        <OrderHistoryContent sessionUser={sessionUser} />
      </CenteredContainer>
    </>
  );
};

export const getServerSideProps = getAuthProps;

OrderHistory.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default OrderHistory;
