import Head from 'next/head';
import { ReactElement } from 'react';
import { getAuthProps } from '@/lib/auth';
import NavBarLayout from '@/layouts/NavBarLayout';
import SkincareVisitSelection from '@/components/screens/VisitSelection/SkinCareVisitSelection';

const SkincareSelection = () => {
  return (
    <>
      <Head>
        <title>Zealthy | Onboarding | Skincare</title>
      </Head>
      <SkincareVisitSelection />
    </>
  );
};

export const getServerSideProps = getAuthProps;

SkincareSelection.getLayout = (page: ReactElement) => {
  return <NavBarLayout>{page}</NavBarLayout>;
};

export default SkincareSelection;
