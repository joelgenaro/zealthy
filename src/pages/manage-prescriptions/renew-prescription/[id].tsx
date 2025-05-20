import Head from 'next/head';
import { getAuthProps } from '@/lib/auth';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import { User } from '@supabase/supabase-js';
import RenewPrescription from '@/components/screens/Prescriptions/RenewPrescription';
import { Database } from '@/lib/database.types';
import Footer from '@/components/shared/layout/Footer';

interface SessionUserProps {
  sessionUser: User;
  patient: Database['public']['Tables']['patient']['Row'];
  profile: Database['public']['Tables']['profiles']['Row'];
}
const RenewPrescriptionPage = ({
  sessionUser,
  patient,
  profile,
}: SessionUserProps) => {
  return (
    <>
      <Head>
        <title>Zealthy | Medication, Prescription Renewals & Delivery</title>
      </Head>
      <CenteredContainer maxWidth="sm">
        <RenewPrescription
          sessionUser={sessionUser}
          patient={patient}
          profile={profile}
        />
      </CenteredContainer>
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

RenewPrescriptionPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default RenewPrescriptionPage;
