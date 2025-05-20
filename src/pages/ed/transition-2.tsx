import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import { getUnauthProps } from '@/lib/auth';
import { ReactElement, useEffect } from 'react';
import Lottie from 'react-lottie';
import animationData from 'public/lottie/drivingCar.json';
import Head from 'next/head';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { VARIANT_7759 } from '../ed';

const TransitionScreen2 = () => {
  const { query, push } = Router;

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.variant === '5674-ED') {
        push({
          pathname: Pathnames.ED_FREQUENCY,
          query: {
            care: SpecificCareOption.ERECTILE_DYSFUNCTION,
            ins: PotentialInsuranceOption.ED_HARDIES,
            variant: '5674-ED',
          },
        });
      } else if (query.variant === '5440') {
        push({
          pathname: Pathnames.ED_FREQUENCY,
          query: {
            care: SpecificCareOption.ERECTILE_DYSFUNCTION,
            variant: '5440',
          },
        });
      } else if (query.variant === VARIANT_7759) {
        push({
          pathname: Pathnames.ED_FREQUENCY,
          query: {
            variant: VARIANT_7759,
          },
        });
      } else {
        Router.push(Pathnames.ED_FREQUENCY);
      }
    }, 3000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      <Head>
        <title>ED Zealthy | Get Started</title>
      </Head>

      <Container maxWidth="sm" sx={{ marginBottom: '12px' }}>
        <Stack alignItems="center">
          <Typography variant="h2" textAlign="center" height="40px">
            {'Answer a few questions to get going.'}
          </Typography>
          <Lottie
            height={150}
            width={150}
            options={{
              loop: true,
              autoplay: true,
              animationData,
            }}
          />
        </Stack>
      </Container>
    </>
  );
};

export const getServerSideProps = getUnauthProps;

TransitionScreen2.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default TransitionScreen2;
