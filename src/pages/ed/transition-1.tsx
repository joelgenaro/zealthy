import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import { getUnauthProps } from '@/lib/auth';
import { Pathnames } from '@/types/pathnames';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Head from 'next/head';
import Router from 'next/router';
import animationData from 'public/lottie/drivingCar.json';
import { ReactElement, useEffect } from 'react';
import Lottie from 'react-lottie';
import { VARIANT_7759 } from '../ed';

const TransitionScreen1 = () => {
  const { push, query } = Router;

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.variant === '5674-ED') {
        push({
          pathname: Pathnames.ED_TRANSITION_2,
          query: {
            care: SpecificCareOption.ERECTILE_DYSFUNCTION,
            ins: PotentialInsuranceOption.ED_HARDIES,
            variant: '5674-ED',
          },
        });
      } else if (query.variant === '5440') {
        push({
          pathname: Pathnames.ED_TRANSITION_2,
          query: {
            care: SpecificCareOption.ERECTILE_DYSFUNCTION,
            variant: '5440',
          },
        });
      } else if (query.variant === VARIANT_7759) {
        push({
          pathname: Pathnames.ED_TRANSITION_2,
          query: {
            variant: VARIANT_7759,
          },
        });
      } else {
        Router.push(Pathnames.ED_TRANSITION_2);
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
            {"You're on the road to better sex."}
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

TransitionScreen1.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default TransitionScreen1;
