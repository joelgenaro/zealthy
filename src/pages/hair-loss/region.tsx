import Head from 'next/head';
import { ReactElement } from 'react';
import { Pathnames } from '@/types/pathnames';
import { getAuthProps } from '@/lib/auth';
import RegionPicker from '@/components/screens/RegionPicker';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

const RegionScreen = () => {
  return (
    <>
      <Head>
        <title>Zealthy | Hair Loss | Select State</title>
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
          <RegionPicker nextPage={Pathnames.HAIR_LOSS_AGE} />
        </Grid>
      </Container>
    </>
  );
};

export const getServerSideProps = getAuthProps;

RegionScreen.getLayout = (page: ReactElement) => {
  return <OnboardingLayout>{page}</OnboardingLayout>;
};

export default RegionScreen;
