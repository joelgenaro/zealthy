import Head from 'next/head';
import { getAuthProps } from '@/lib/auth';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement } from 'react';
import Gap from '@/components/shared/layout/Gap';
import { PrescriptionManage } from '@/components/screens/Profile/components/PrescriptionManage';

const CancelPrescription = () => {
  return (
    <>
      <Head>
        <title>Manage Prescription | Zealthy</title>
      </Head>
      <CenteredContainer maxWidth="sm">
        <PrescriptionManage />
        <Gap />
      </CenteredContainer>
    </>
  );
};

export const getServerSideProps = getAuthProps;

CancelPrescription.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default CancelPrescription;
