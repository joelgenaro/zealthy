import Head from 'next/head';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import { getAuthProps } from '@/lib/auth';
import LabWorkSubmit from '@/components/screens/LabWorkSubmit';
import Footer from '@/components/shared/layout/Footer';

const LabWorkUpload = () => {
  return (
    <>
      <Head>
        <title>Zealthy | Lab Report Upload</title>
      </Head>
      <CenteredContainer maxWidth="sm">
        <LabWorkSubmit />
      </CenteredContainer>
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

LabWorkUpload.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default LabWorkUpload;
