import Head from 'next/head';
import { ReactElement } from 'react';
import NavBarLayout from '@/layouts/NavBarLayout';
import HairLossStart from '@/components/screens/GetStarted/components/HairLossStart';

const HairLossStartScreen = () => {
  return (
    <>
      <Head>
        <title>Treat Hair Loss with Zealthy</title>
      </Head>
      <HairLossStart />
    </>
  );
};

HairLossStartScreen.getLayout = (page: ReactElement) => {
  return <NavBarLayout>{page}</NavBarLayout>;
};

export default HairLossStartScreen;
