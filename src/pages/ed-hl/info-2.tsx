import Head from 'next/head';
import { ReactElement } from 'react';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import NavBarLayout from '@/layouts/NavBarLayout';

const SexPlusHairInfo2 = () => {
  const handleContinue = () => {
    Router.push(Pathnames.EDHL_PRESIGNUP_QUESTION_5);
  };

  return (
    <>
      <Head>
        <title>Sex + Hair</title>
      </Head>
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'left',
        }}
      >
        <Stack gap={4} alignItems="center">
          <Typography variant="h2">
            Taking Sex + Hair daily can make it easier to have spontaneous sex,
            as it can remain active for the entire day
          </Typography>
          <Button
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: '#00531B',
              color: 'white',
              marginTop: 10,
              fontWeight: 'bold',
              textTransform: 'none',
            }}
            size="large"
            onClick={handleContinue}
          >
            Continue
          </Button>
        </Stack>
      </Container>
    </>
  );
};

SexPlusHairInfo2.getLayout = (page: ReactElement) => {
  return <NavBarLayout>{page}</NavBarLayout>;
};

export default SexPlusHairInfo2;
