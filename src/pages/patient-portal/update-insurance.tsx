import { ReactElement } from 'react';
import { Container } from '@mui/material';
import { getAuthProps } from '@/lib/auth';
import Head from 'next/head';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import Footer from '@/components/shared/layout/Footer';
import InsuranceUpdate from '@/components/shared/InsuranceUpdate';
import { Database } from '@/lib/database.types';

interface UpdateInsurancePageProps {
  patient: Database['public']['Tables']['patient']['Row'];
}

const UpdateInsurancePage = ({ patient }: UpdateInsurancePageProps) => {
  return (
    <>
      <Container maxWidth="sm">
        <Head>
          <title>Update Insurance</title>
        </Head>
        <InsuranceUpdate patient={patient} />
      </Container>
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

UpdateInsurancePage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default UpdateInsurancePage;
