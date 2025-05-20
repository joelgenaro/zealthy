import Head from 'next/head';
import { ReactElement } from 'react';
import { getAuthProps } from '@/lib/auth';
import { RegionUnsupportedMessage } from '../ed/unsupported-region';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { Pathnames } from '@/types/pathnames';

const RegionUnsupported = () => {
  return (
    <>
      <Head>
        <title>Zealthy | ED | Region Unsupported</title>
      </Head>
      <RegionUnsupportedMessage />
    </>
  );
};

export const getServerSideProps = getAuthProps;

RegionUnsupported.getLayout = (page: ReactElement) => (
  <OnboardingLayout back={Pathnames.CARE_SELECTION}>{page}</OnboardingLayout>
);

export default RegionUnsupported;
