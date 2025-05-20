import SwitchPrescriptionBundled from '@/components/screens/Prescriptions/SwitchPresctiptionBundled/SwitchPrescriptionBundled';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import { getAuthProps } from '@/lib/auth';
import Head from 'next/head';
import React, { ReactElement } from 'react';

const SwitchPrescriptionBundledPage = () => {
  return (
    <>
      <Head>
        <title>Change Prescription | Zealthy</title>
      </Head>
      <CenteredContainer maxWidth="sm">
        <SwitchPrescriptionBundled />
      </CenteredContainer>
    </>
  );
};

export const getServerSideProps = getAuthProps;

SwitchPrescriptionBundledPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default SwitchPrescriptionBundledPage;
