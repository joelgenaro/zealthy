import Head from 'next/head';
import { ReactElement, useEffect } from 'react';
import { getUnauthProps } from '@/lib/auth';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import { Pathnames } from '@/types/pathnames';
import BirthDayPicker from '@/components/screens/BirthDayPicker';
import Container from '@mui/material/Container';
import Router from 'next/router';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { useIntakeState } from '@/components/hooks/useIntake';
import getConfig from '../../../config';

const AgeScreen = () => {
  const { query, push } = Router;

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  const { variant } = useIntakeState();

  useEffect(() => {
    if (query.variant === '5674-ED') {
      push({
        query: {
          care: SpecificCareOption.ERECTILE_DYSFUNCTION,
          ins: PotentialInsuranceOption.ED_HARDIES,
          variant: '5674-ED',
        },
      });
    }
  }, [push, query.variant]);

  return (
    <>
      <Head>
        <title>{siteName} | ED | Enter Date of Birth</title>
      </Head>
      <Container maxWidth="sm">
        <BirthDayPicker
          nextPage={Pathnames.ED_SIGNUP}
          shouldUpdateProfile={false}
          showNoPhoneOrVideo={true}
        />
      </Container>
    </>
  );
};

export const getServerSideProps = getUnauthProps;

AgeScreen.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default AgeScreen;
