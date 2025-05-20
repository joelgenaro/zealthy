import { Container } from '@mui/material';
import { getAuthProps } from '@/lib/auth';
import Head from 'next/head';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import Footer from '@/components/shared/layout/Footer';
import MembershipManage from '@/components/screens/Profile/components/MembershipManage';

const ManageMemberships = () => {
  return (
    <>
      <Container maxWidth="sm">
        <Head>
          <title>Manage Memberships | Zealthy</title>
        </Head>
        <MembershipManage />
      </Container>
      <Footer />
    </>
  );
};
export const getServerSideProps = getAuthProps;

ManageMemberships.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default ManageMemberships;
