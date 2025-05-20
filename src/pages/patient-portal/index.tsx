import Head from 'next/head';
import { getPatientPortalProps, PatientSubscriptionProps } from '@/lib/auth';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import PatientPortal from '@/components/screens/PatientPortal';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement, useEffect } from 'react';
import Footer from '@/components/shared/layout/Footer';
import { Database } from '@/lib/database.types';
import { useFlowActions } from '@/components/hooks/useFlow';
import getConfig from '../../../config';

type Props = {
  visibleSubscriptions: PatientSubscriptionProps[];
  patient: Database['public']['Tables']['patient']['Row'];
  profile: Database['public']['Tables']['profiles']['Row'];
};

const PatientProfile = (props: Props) => {
  const { clearFlow } = useFlowActions();
  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  useEffect(() => {
    clearFlow();
  }, []);

  return (
    <>
      <Head>
        <title>{siteName} | Home</title>
      </Head>
      <CenteredContainer maxWidth="sm">
        <PatientPortal {...props} />
      </CenteredContainer>
      <Footer />
    </>
  );
};

export const getServerSideProps = getPatientPortalProps;

PatientProfile.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default PatientProfile;
