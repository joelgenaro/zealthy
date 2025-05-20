import Head from 'next/head';
import { ReactElement } from 'react';
import { Stack } from '@mui/material';
import Profile from '@/components/screens/Profile';
import { getAuthProps } from '@/lib/auth';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import Footer from '@/components/shared/layout/Footer';
import getConfig from '../../../../config';

const ProfileHome = () => {
  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  return (
    <>
      <Head>
        <title>{siteName}</title>
      </Head>
      <Stack textAlign="center" spacing={0}>
        <Profile />
        <Footer />
      </Stack>
    </>
  );
};

export const getServerSideProps = getAuthProps;

ProfileHome.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default ProfileHome;
