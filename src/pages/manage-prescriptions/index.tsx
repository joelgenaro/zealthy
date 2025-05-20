import Head from 'next/head';
import { getAuthProps } from '@/lib/auth';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import ManagePrescription from '@/components/screens/Prescriptions/ManagePrescription';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import { Database } from '@/lib/database.types';
import Footer from '@/components/shared/layout/Footer';

interface Props {
  patient: Database['public']['Tables']['patient']['Row'];
}

const PatientProfile = ({ patient }: Props) => {
  return (
    <>
      <Head>
        <title>Zealthy | Medication, Prescription Renewals & Delivery</title>
      </Head>
      <CenteredContainer maxWidth="sm">
        <ManagePrescription patient={patient} />
      </CenteredContainer>
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

PatientProfile.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default PatientProfile;
