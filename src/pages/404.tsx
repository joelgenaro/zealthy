import Head from 'next/head';
import { ReactElement } from 'react';
import Router, { useRouter } from 'next/router';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import getConfig from '../../config';

const FourOhFour = () => {
  const router = useRouter();
  const { asPath } = router;

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  return (
    <>
      <Head>
        <title>{siteName} | Page not found</title>
      </Head>
      <Container maxWidth="md" style={{ position: 'relative', top: '25%' }}>
        <Stack alignItems="center" gap="2rem">
          <Typography textAlign="center" variant="h1">
            {`Sorry, this page doesn't exist.`}
          </Typography>
          <Stack direction="row" gap="1rem">
            <Button
              size="small"
              style={{ width: 'fit-content' }}
              onClick={() => Router.back()}
            >
              Go Back
            </Button>
            <Button
              size="small"
              style={{ width: 'fit-content' }}
              onClick={() => Router.push('/')}
            >
              Go Home
            </Button>
          </Stack>
        </Stack>
      </Container>
    </>
  );
};

FourOhFour.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default FourOhFour;
