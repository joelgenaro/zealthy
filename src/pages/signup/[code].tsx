import Head from 'next/head';
import SignUp from '@/components/screens/SignUp';
import { getUnauthProps } from '@/lib/auth';
import { ReactElement } from 'react';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import getConfig from '../../../config';

export default function SignUpPage() {
  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  return (
    <>
      <Head>
        <title>{siteName} | Sign Up</title>
      </Head>
      <SignUp />
    </>
  );
}

export const getServerSideProps = getUnauthProps;

SignUpPage.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};
