import Loading from '@/components/shared/Loading/Loading';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import Head from 'next/head';
import { ReactElement, useEffect } from 'react';
import { usePatientAsync } from '@/components/hooks/usePatient';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';

const CreatePatient = () => {
  const { createPatient } = usePatientAsync();

  useEffect(() => {
    createPatient().then(() => Router.push(Pathnames.ED_COMPLETE_PROFILE));
  }, [createPatient]);

  return (
    <>
      <Head>
        <title>Zealthy Visit</title>
      </Head>
      <Loading />
    </>
  );
};

CreatePatient.getLayout = (page: ReactElement) => {
  return <OnboardingLayout>{page}</OnboardingLayout>;
};

export default CreatePatient;
