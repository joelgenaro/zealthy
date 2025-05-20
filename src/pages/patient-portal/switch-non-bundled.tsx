import Head from 'next/head';
import { getPatientPortalProps, PatientSubscriptionProps } from '@/lib/auth';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import Footer from '@/components/shared/layout/Footer';
import { Database } from '@/lib/database.types';
import Container from '@mui/material/Container';
import SwitchWeightLossNonBundled from '@/components/shared/AddOnPayment/SwitchWeightLossNonBundled';

type Props = {
  visibleSubscriptions: PatientSubscriptionProps[];
  patient: Database['public']['Tables']['patient']['Row'];
  profile: Database['public']['Tables']['profiles']['Row'];
};

const SwitchBundledSemaglutide = (props: Props) => {
  return (
    <Container maxWidth="xs">
      <Head>
        <title>Switch to Non-Bundled Subscription | Zealthy</title>
      </Head>
      <SwitchWeightLossNonBundled {...props} />
      <Footer />
    </Container>
  );
};

export const getServerSideProps = getPatientPortalProps;

SwitchBundledSemaglutide.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default SwitchBundledSemaglutide;
