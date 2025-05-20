import Head from 'next/head';
import { getPatientPortalProps } from '@/lib/auth';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import AccountabilityPartner from '@/components/screens/AccountabilityPartner';
import AccountabilityPartnerVariant from '@/components/screens/AccountabilityPartner/AccountabilityPartner-variant';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import Footer from '@/components/shared/layout/Footer';
import { Database } from '@/lib/database.types';

interface Props {
  patient: Database['public']['Tables']['patient']['Row'];
}

const AccountabilityPartnerPage = ({ patient }: Props) => {
  return (
    <>
      <Head>
        <title>Zealthy | Accountability Partner</title>
      </Head>
      <CenteredContainer maxWidth="sm">
        {patient?.region === 'CA' || patient?.region === 'FL' ? (
          <AccountabilityPartnerVariant />
        ) : (
          <AccountabilityPartner />
        )}
      </CenteredContainer>
      <Footer />
    </>
  );
};

export const getServerSideProps = getPatientPortalProps;

AccountabilityPartnerPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default AccountabilityPartnerPage;
