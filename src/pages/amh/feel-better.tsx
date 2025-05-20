import Head from 'next/head';
import { ReactElement } from 'react';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';

import { useIsMobile } from '@/components/hooks/useIsMobile';
import NavBarLayout from '@/layouts/NavBarLayout';
import Container from '@mui/material/Container';

import AsyncMentalHealthStart from '@/components/screens/Question/components/AsyncMentalHealthStart';
import Stack from '@mui/system/Stack';

const AmhFeelBetterPage = () => {
  const isMobile = useIsMobile();

  const handleContinue = () => {
    Router.push(Pathnames.AMH_QUESTION_2);
  };

  return (
    <>
      <Head>
        <title>Zealthy Mental Health</title>
      </Head>
      <Container style={{ maxWidth: '1500px' }}>
        <Stack gap={6}>
          <AsyncMentalHealthStart onClick={handleContinue} />
        </Stack>
      </Container>
    </>
  );
};

AmhFeelBetterPage.getLayout = (page: ReactElement) => {
  return <NavBarLayout>{page}</NavBarLayout>;
};

export default AmhFeelBetterPage;
