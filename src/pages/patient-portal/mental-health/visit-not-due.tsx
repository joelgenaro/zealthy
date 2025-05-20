import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import Head from 'next/head';
import { ReactElement } from 'react';
import { getAuthProps } from '@/lib/auth';
import CenteredContainer from '@/components/shared/layout/CenteredContainer/CenteredContainer';
import { Box, Button, Typography } from '@mui/material';
import Router from 'next/router';

const VisitNotDue = () => {
  return (
    <>
      <Head>
        <title>Zealthy | Mental Health Visit Not Due</title>
      </Head>
      <CenteredContainer maxWidth="md">
        <Box
          display={'flex'}
          flexDirection={'column'}
          alignItems="center"
          mt="5rem"
        >
          <Typography variant="h2" mt="5rem" textAlign={'center'}>
            {`You're not due for a visit with your provider yet`}
          </Typography>
          <Typography variant="h5" mt="2rem" textAlign={'center'}>
            {`If you have any questions you can message your provider within your messaging thread.`}
          </Typography>
          <Button
            sx={{ marginTop: '2rem', width: '35%' }}
            onClick={() => Router.push('/messages')}
          >
            {`Message my provider`}
          </Button>
          <Button
            sx={{
              marginTop: '1rem',
              width: '35%',
              backgroundColor: 'grey',
            }}
            onClick={() => Router.push('/patient-portal/visit/discover-care')}
          >
            {`Explore Zealthy`}
          </Button>
        </Box>
      </CenteredContainer>
    </>
  );
};

export const getServerSideProps = getAuthProps;

VisitNotDue.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default VisitNotDue;
