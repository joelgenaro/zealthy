import Head from 'next/head';
import { getAuthProps } from '@/lib/auth';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import LabWorkDetail from '@/components/screens/LabWork';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import Footer from '@/components/shared/layout/Footer';

const LabWork = () => {
  return (
    <>
      <Head>
        <title>Zealthy | Lab Work</title>
      </Head>
      <CenteredContainer maxWidth="sm">
        <LabWorkDetail />
      </CenteredContainer>
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

LabWork.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default LabWork;
