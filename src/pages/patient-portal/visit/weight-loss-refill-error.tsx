import Head from 'next/head';
import Router from 'next/router';
import { ReactElement } from 'react';
import { Button, Container, Stack, Typography } from '@mui/material';
import { Pathnames } from '@/types/pathnames';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';

const WeightLossRefillPage = () => {
  return (
    <>
      <Head>
        <title>Zealthy</title>
      </Head>
      <Container maxWidth="xs">
        <Stack gap="3rem">
          <Typography variant="h2">
            You are unable to submit a refill request for weight loss since you
            already have a pending prescription request.
          </Typography>
          <Typography variant="h2">
            If you have questions about your prescription request, select below
            to message your care team.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              Router.push(`${Pathnames.MESSAGES}?complete=weight-loss`)
            }
          >
            Message your care team
          </Button>
        </Stack>
      </Container>
    </>
  );
};

WeightLossRefillPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default WeightLossRefillPage;
