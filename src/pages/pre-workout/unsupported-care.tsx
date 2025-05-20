import Head from 'next/head';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { ReactElement } from 'react';
import NavBarLayout from '@/layouts/NavBarLayout';

const PreworkoutCareUnsupported = () => {
  return (
    <>
      <Head>
        <title>Zealthy | Onboarding | Preworkout Unsupported</title>
      </Head>
      <Container maxWidth="xs">
        <Typography sx={{ marginBottom: '3rem' }}>
          {`Based on your sex assigned at birth, you may not be a candidate for this treatment plan. Go back to select a different sex assigned at birth if you entered it incorrectly.`}
        </Typography>
      </Container>
    </>
  );
};
PreworkoutCareUnsupported.getLayout = (page: ReactElement) => {
  return <NavBarLayout>{page}</NavBarLayout>;
};

export default PreworkoutCareUnsupported;
