import Head from 'next/head';
import dynamic from 'next/dynamic';
import { ReactElement } from 'react';
import { getAuthProps } from '@/lib/auth';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import getConfig from '../../../config';

const Messages = dynamic(() => import('@/components/screens/Messages'), {
  ssr: false,
});

const MessagesHome = () => {
  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  return (
    <>
      <Head>
        <title>{siteName} | Messages</title>
      </Head>

      <Messages />
    </>
  );
};

export const getServerSideProps = getAuthProps;

MessagesHome.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};
export default MessagesHome;
