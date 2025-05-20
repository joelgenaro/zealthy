import Head from 'next/head';
import { ReactElement } from 'react';
import PharmacySelection from '@/components/screens/PharmacySelection';
import { Container } from '@mui/material';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { getAuthProps } from '@/lib/auth';

const PharmacySelect = () => {
  return (
    <Container maxWidth="sm">
      <Head>
        <title>Select Pharmacy | Zealthy</title>
      </Head>
      <PharmacySelection />
    </Container>
  );
};

export const getServerSideProps = getAuthProps;

PharmacySelect.getLayout = (page: ReactElement) => (
  <OnboardingLayout>{page}</OnboardingLayout>
);

export default PharmacySelect;
