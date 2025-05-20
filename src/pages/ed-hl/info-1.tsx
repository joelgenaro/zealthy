import Head from 'next/head';
import { ReactElement } from 'react';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import { Box, Typography, CircularProgress } from '@mui/material';
import NavBarLayout from '@/layouts/NavBarLayout';

const SexPlusHairInfo1 = () => {
  const handleContinue = () => {
    Router.push(Pathnames.EDHL_PRESIGNUP_QUESTION_3);
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
          <Box
            position="relative"
            display="inline-flex"
            justifyContent="center"
          >
            <CircularProgress
              variant="determinate"
              value={52}
              size={180}
              thickness={2}
              sx={{
                color: '#008A2E',
              }}
            />
            <Box
              top="50%"
              left="50%"
              position="absolute"
              sx={{
                transform: 'translate(-50%, -50%)',
              }}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="h1" component="div" fontWeight="bold">
                52%
              </Typography>
            </Box>
          </Box>
          <Typography variant="h2" fontWeight="bold">
            of men ages 40 to 70 experience some form of ED
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
              '&:hover': {
                backgroundColor: '#003311',
              },
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

SexPlusHairInfo1.getLayout = (page: ReactElement) => {
  return <NavBarLayout>{page}</NavBarLayout>;
};

export default SexPlusHairInfo1;
