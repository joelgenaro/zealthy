import { Container } from '@mui/material';
import { getAuthProps } from '@/lib/auth';
import Head from 'next/head';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import Footer from '@/components/shared/layout/Footer';
import ConfirmUpgrade from '@/components/screens/Profile/components/MembershipManage/components/ConfirmUpgrade';

const ManageMembershipsUpgrade = () => {
  return (
    <>
      <Container maxWidth="sm">
        <Head>
          <title>Manage Memberships Upgrade | Zealthy</title>
        </Head>
        <ConfirmUpgrade />
      </Container>
      <Footer />
    </>
  );
};
export const getServerSideProps = getAuthProps;

ManageMembershipsUpgrade.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default ManageMembershipsUpgrade;
