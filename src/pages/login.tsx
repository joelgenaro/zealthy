import Head from 'next/head';
import LogIn from '@/components/screens/LogIn';
import { ReactElement } from 'react';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import { getUnauthProps } from '@/lib/auth';
import getConfig from '../../config';

const Login = () => {
  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  return (
    <>
      <Head>
        <title>{siteName} | Log In</title>
      </Head>
      <LogIn />
    </>
  );
};

export const getServerSideProps = getUnauthProps;

Login.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default Login;
