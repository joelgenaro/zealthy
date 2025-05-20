import Head from 'next/head';
import { ReactElement } from 'react';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import { getStartedProps } from '@/lib/auth';

const StartPage = () => {
  return (
    <>
      <Head>
        <title>Zealthy</title>
      </Head>
    </>
  );
};

StartPage.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export const getServerSideProps = getStartedProps;

export default StartPage;
