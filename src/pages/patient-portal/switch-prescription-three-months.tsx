import SwitchPrescription from '@/components/screens/Prescriptions/SwitchPrescription';
import SwitchPrescriptionThreeMonths from '@/components/screens/Prescriptions/SwitchPrescriptionThreeMonths';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import { getAuthProps } from '@/lib/auth';
import Head from 'next/head';
import React, { ReactElement } from 'react';

const SwitchPrescriptionThreeMonthsPage = () => {
  return (
    <>
      <Head>
        <title>Change Prescription | Zealthy</title>
      </Head>
      <CenteredContainer maxWidth="sm">
        <SwitchPrescriptionThreeMonths />
      </CenteredContainer>
    </>
  );
};

export const getServerSideProps = getAuthProps;

SwitchPrescriptionThreeMonthsPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default SwitchPrescriptionThreeMonthsPage;
