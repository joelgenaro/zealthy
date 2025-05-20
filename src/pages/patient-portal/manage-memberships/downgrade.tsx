import { Container } from '@mui/material';
import { getAuthProps } from '@/lib/auth';
import Head from 'next/head';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import Footer from '@/components/shared/layout/Footer';
import ConfirmDowngrade from '@/components/screens/Profile/components/MembershipManage/components/ConfirmDowngrade';

const ManageMembershipsDowngrade = () => {
  return (
    <>
      <Container maxWidth="sm">
        <Head>
          <title>Manage Memberships Downgrade | Zealthy</title>
        </Head>
        <ConfirmDowngrade />
      </Container>
      <Footer />
    </>
  );
};
export const getServerSideProps = getAuthProps;

ManageMembershipsDowngrade.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default ManageMembershipsDowngrade;
