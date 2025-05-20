import Head from 'next/head';
import { getAuthProps } from '@/lib/auth';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import Footer from '@/components/shared/layout/Footer';
import PriorAuthTracker from '@/components/screens/PatientPortal/components/PriorAuthTracker';
import { useAllVisiblePatientSubscription } from '@/components/hooks/data';

const PriorAuthorizationsPage = () => {
  const { data: visibleSubscriptions } = useAllVisiblePatientSubscription();

  const weightLossSubs = visibleSubscriptions?.filter(s =>
    s.subscription.name.includes('Weight Loss')
  );
  return (
    <>
      <Head>
        <title>Zealthy | Prior Authorizarions</title>
      </Head>
      <CenteredContainer maxWidth="sm">
        <PriorAuthTracker
          subscriptions={visibleSubscriptions}
          bundle={
            !!weightLossSubs?.find(s => s?.price === 449) ||
            !!weightLossSubs?.find(s => s?.price === 297)
          }
        />
      </CenteredContainer>
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

PriorAuthorizationsPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default PriorAuthorizationsPage;
