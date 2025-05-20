import Head from 'next/head';
import { ReactElement, useEffect } from 'react';
import { Container, Grid, Typography } from '@mui/material';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { getAuthProps } from '@/lib/auth';
import { Pathnames } from '@/types/pathnames';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import RegionPicker from '@/components/screens/RegionPicker';
import Router from 'next/router';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { usePatientState } from '@/components/hooks/usePatient';
import {
  useAddWeightLog,
  useUpdatePatient,
} from '@/components/hooks/mutations';

import { useLanguage } from '@/components/hooks/data';
import getConfig from '../../../config';

const RegionScreen = () => {
  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  const { specificCare, potentialInsurance, variant } = useIntakeState();
  const { push, query } = Router;
  const { addSpecificCare, addPotentialInsurance, addVariant } =
    useIntakeActions();
  const patientState = usePatientState();
  const updatePatient = useUpdatePatient();
  const addWeight = useAddWeightLog();
  const language = useLanguage();

  const handleUpdatePatient = async () => {
    await updatePatient.mutateAsync({
      id: patientState?.id,
      height: patientState?.height_ft! * 12 + patientState?.height_in!,
      weight: patientState?.weight,
    });
    await addWeight.mutateAsync({
      patient_id: patientState?.id,
      weight: patientState?.weight!,
      date_logged: new Date().toISOString(),
    });
  };

  useEffect(() => {
    const storedState = localStorage.getItem('sessionState');

    if (storedState) {
      const { specificCare, potentialInsurance, variant } =
        JSON.parse(storedState);

      addSpecificCare(specificCare);
      addPotentialInsurance(potentialInsurance);
      addVariant(variant);

      localStorage.removeItem('sessionState');
    }

    const newQuery = {
      care: specificCare || query.care,
      variant: variant || '0',
      ins: potentialInsurance || '',
    };

    // Check if the query parameters need to be updated
    if (
      newQuery.care !== query.care ||
      newQuery.variant !== query.variant ||
      newQuery.ins !== query.ins
    ) {
      push({ query: newQuery }, undefined, { shallow: true });
    }

    // Check before updating the state to avoid unnecessary re-renders
    if (query.care && query.care !== specificCare) {
      addSpecificCare(query.care as SpecificCareOption);
    }
    if (query.ins && query.ins !== potentialInsurance) {
      addPotentialInsurance(query.ins as PotentialInsuranceOption);
    }
    if (query.variant && query.variant !== variant) {
      addVariant(query.variant as string);
    }
  }, [
    query,
    specificCare,
    potentialInsurance,
    variant,
    push,
    addSpecificCare,
    addPotentialInsurance,
    addVariant,
  ]);

  useEffect(() => {
    if (specificCare && specificCare == 'Weight loss') {
      window.freshpaint?.track('weight-loss-region-screen');
    }
  }, [specificCare]);

  useEffect(() => {
    window.freshpaint?.track('region-screen');
    window.STZ?.trackEvent('Lead');
    window.rudderanalytics?.track('Lead_New');
  }, []);

  useEffect(() => {
    if (patientState?.weight && patientState?.id) {
      handleUpdatePatient();
    }
  }, [patientState]);

  let confirm = 'Confirm you’re eligible';
  let select = 'Select your state.';
  let availealeInYourAre = `We need to make sure ${siteName} is available in your state.`;

  if (language === 'esp') {
    confirm = 'Confirma que eres elgible';
    select = 'Selecciona tu estado';
    availealeInYourAre = `Necesitamos asegurarnos de que ${siteName} esté disponible en tu estado.`;
  }
  return (
    <>
      <Head>
        <title>{siteName} | Onboarding | Select State</title>
      </Head>
      <Container maxWidth="sm">
        <Grid container direction="column" gap="48px">
          <Grid container direction="column" gap="16px">
            <Typography variant="h4">{confirm}</Typography>
            <Typography variant="h2">{select}</Typography>
            <Typography>{availealeInYourAre}</Typography>
          </Grid>
          <RegionPicker nextPage={Pathnames.AGE_SCREEN} />
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
