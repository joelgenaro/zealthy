import { Container } from '@mui/material';
import { getAuthProps } from '@/lib/auth';
import Head from 'next/head';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import Footer from '@/components/shared/layout/Footer';
import { usePatient } from '@/components/hooks/data';
import GLP1Treatment from '@/components/screens/GLP1Treatment';

const WeightLossTreatmentPage = () => {
  const { data: patient } = usePatient();
  return (
    <>
      <Container maxWidth="sm">
        <Head>
          <title>GLP1 Treatments</title>
        </Head>
        <GLP1Treatment />
      </Container>
      <Footer />
    </>
  );
};
export const getServerSideProps = getAuthProps;

WeightLossTreatmentPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default WeightLossTreatmentPage;
