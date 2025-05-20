import Head from 'next/head';
import { ReactElement } from 'react';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import { getAuthProps } from '@/lib/auth';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import TrustpilotReview from '@/components/screens/PatientPortal/components/TrustpilotReview';
import Footer from '@/components/shared/layout/Footer';

const TrustpilotPage = () => {
  return (
    <>
      <Head>
        <title>Trustpilot Review | Zealthy</title>
      </Head>
      <CenteredContainer maxWidth="sm">
        <TrustpilotReview />
      </CenteredContainer>
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

TrustpilotPage.getLayout = (page: ReactElement) => (
  <PatientPortalNav>{page}</PatientPortalNav>
);

export default TrustpilotPage;
