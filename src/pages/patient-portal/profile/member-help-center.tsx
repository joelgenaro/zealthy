import Head from 'next/head';
import { getAuthProps } from '@/lib/auth';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import Footer from '@/components/shared/layout/Footer';
import PriorAuthTracker from '@/components/screens/PatientPortal/components/PriorAuthTracker';
import { useAllVisiblePatientSubscription } from '@/components/hooks/data';
import MemberHelpCenter from '@/components/screens/Profile/components/MemberHelpCenter';

const MemberHelpCenterPage = () => {
  return (
    <>
      <Head>
        <title>Zealthy | Member Help Center</title>
      </Head>
      <CenteredContainer maxWidth="sm">
        <MemberHelpCenter />
      </CenteredContainer>
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

MemberHelpCenterPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default MemberHelpCenterPage;
