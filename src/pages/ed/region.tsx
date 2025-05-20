import Head from 'next/head';
import { getUnauthProps } from '@/lib/auth';
import { ReactElement } from 'react';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import { Pathnames } from '@/types/pathnames';
import RegionPicker from '@/components/screens/RegionPicker';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

const RegionScreen = () => {
  return (
    <>
      <Head>
        <title>Zealthy | ED | Select State</title>
      </Head>
      <Container maxWidth="sm">
        <Grid container direction="column" gap="48px">
          <Grid container direction="column" gap="16px">
            <Typography variant="h4">Confirm you’re eligible</Typography>
            <Typography variant="h2">Select your state.</Typography>
            <Typography>
              We need to make sure Zealthy is available in your state.
            </Typography>
          </Grid>
          <RegionPicker
            nextPage={Pathnames.ED_AGE}
            shouldCreatePatient={false}
          />
        </Grid>
      </Container>
    </>
  );
};

export const getServerSideProps = getUnauthProps;

RegionScreen.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default RegionScreen;
