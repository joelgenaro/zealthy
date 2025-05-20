import Head from 'next/head';
import { getAuthProps } from '@/lib/auth';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import { User } from '@supabase/supabase-js';
import RecurringCompoundDetails from '@/components/screens/Prescriptions/RecurringCompoundDetails';
import Gap from '@/components/shared/layout/Gap';

const RecurringCompound = () => {
  return (
    <>
      <Head>
        <title>Recurring Compound Details | Zealthy</title>
      </Head>
      <CenteredContainer maxWidth="sm">
        <RecurringCompoundDetails />
        <Gap />
      </CenteredContainer>
    </>
  );
};

export const getServerSideProps = getAuthProps;

RecurringCompound.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default RecurringCompound;
