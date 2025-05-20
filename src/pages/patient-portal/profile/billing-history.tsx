import Head from 'next/head';
import { ReactElement } from 'react';
import { Database } from '@/lib/database.types';
import { getPatientPortalProps } from '@/lib/auth';
import Footer from '@/components/shared/layout/Footer';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import BillingHistory from '@/components/screens/Profile/components/BillingHistory';

interface Props {
  patient: Database['public']['Tables']['patient']['Row'];
}

const BillingHistoryHome = ({ patient }: Props) => {
  return (
    <>
      <Head>
        <title>Billing History | Zealthy</title>
      </Head>
      <BillingHistory patient={patient} />
      <Footer />
    </>
  );
};

export const getServerSideProps = getPatientPortalProps;

BillingHistoryHome.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default BillingHistoryHome;
