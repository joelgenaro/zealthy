import Head from 'next/head';
import { ReactElement } from 'react';
import { Container } from '@mui/material';
import { getAuthProps } from '@/lib/auth';
import Footer from '@/components/shared/layout/Footer';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import BundledMembershipManage from '@/components/screens/Profile/components/MembershipManage/BundledMembershipManage';

const ManageBundledMemberships = () => {
  return (
    <Container maxWidth="sm">
      <Head>
        <title>Manage Memberships | Zealthy</title>
      </Head>
      <BundledMembershipManage />
      <Footer />
    </Container>
  );
};
export const getServerSideProps = getAuthProps;

ManageBundledMemberships.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default ManageBundledMemberships;
