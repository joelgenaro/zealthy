import Head from 'next/head';
import dynamic from 'next/dynamic';
import { getUnauthProps } from '@/lib/auth';
import { ReactElement, Suspense } from 'react';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import getConfig from '../../../config';

const LoadingState = dynamic(
  () => import('@/components/shared/LoadingState/LoadingState'),
  {
    ssr: true,
  }
);

const SignUp = dynamic(() => import('@/components/screens/SignUp'), {
  loading: () => <LoadingState />,
  ssr: false,
});

export default function SignUpPage() {
  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  return (
    <>
      <Head>
        <title>{siteName} | Sign Up</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Suspense fallback={<LoadingState />}>
        <SignUp />
      </Suspense>
    </>
  );
}

export const getServerSideProps = getUnauthProps;

SignUpPage.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};
