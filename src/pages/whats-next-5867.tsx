import Head from 'next/head';
import { ReactElement } from 'react';
import { Box } from '@mui/material';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import NowWhatCard from '@/components/screens/Question/components/NowWhatCard';

const WhatsNext5867 = () => {
  return (
    <>
      <Head>
        <title>{`What's next? | Zealthy`}</title>
      </Head>
    </>
  );
};

WhatsNext5867.getLayout = (page: ReactElement) => (
  <DefaultNavLayout>
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      width="100%"
    >
      <NowWhatCard />
    </Box>
  </DefaultNavLayout>
);

export default WhatsNext5867;
