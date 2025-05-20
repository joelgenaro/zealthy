import SwitchPrescription from '@/components/screens/Prescriptions/SwitchPrescription';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import { getAuthProps } from '@/lib/auth';
import Head from 'next/head';
import React, { ReactElement } from 'react';

const SwitchPrescriptionPage = () => {
  return (
    <>
      <Head>
        <title>Change Prescription | Zealthy</title>
      </Head>
      <CenteredContainer maxWidth="sm">
        <SwitchPrescription />
      </CenteredContainer>
    </>
  );
};

export const getServerSideProps = getAuthProps;

SwitchPrescriptionPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default SwitchPrescriptionPage;
