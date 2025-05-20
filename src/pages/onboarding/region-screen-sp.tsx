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

const RegionScreen = () => {
  const { specificCare, potentialInsurance, variant } = useIntakeState();
  const { push, query } = Router;
  const { addSpecificCare, addPotentialInsurance, addVariant } =
    useIntakeActions();
  const patientState = usePatientState();
  const updatePatient = useUpdatePatient();
  const addWeight = useAddWeightLog();

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
  }, []);

  useEffect(() => {
    if (patientState?.weight && patientState?.id) {
      handleUpdatePatient();
    }
  }, [patientState]);

  return (
    <>
      <Head>
        <title>Zealthy | Onboarding | Selecciona tu estado.</title>
      </Head>
      <Container maxWidth="sm">
        <Grid container direction="column" gap="48px">
          <Grid container direction="column" gap="16px">
            <Typography variant="h4">Confirma que eres elegible</Typography>
            <Typography variant="h2">Estado de residencia Continuar</Typography>
            <Typography>
              Necesitamos asegurarnos de que Zealthy esté disponible en tu
              estado.
            </Typography>
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
