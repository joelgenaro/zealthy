import Head from 'next/head';
import { ReactElement } from 'react';
import { Pathnames } from '@/types/pathnames';
import { getAuthProps } from '@/lib/auth';
import BirthDayPicker from '@/components/screens/BirthDayPicker';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import Container from '@mui/material/Container';

const AgeScreen = () => {
  return (
    <>
      <Head>
        <title>Zealthy | Hair Loss | Enter Date of Birth</title>
      </Head>
      <Container maxWidth="sm">
        <BirthDayPicker nextPage={Pathnames.HAIR_LOSS_COMPLETE_PROFILE} />
      </Container>
    </>
  );
};

export const getServerSideProps = getAuthProps;

AgeScreen.getLayout = (page: ReactElement) => {
  return <OnboardingLayout>{page}</OnboardingLayout>;
};

export default AgeScreen;
