import Head from 'next/head';
import { Container } from '@mui/material';
import { ReactElement, useEffect } from 'react';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { getAuthProps } from '@/lib/auth';
import { Pathnames } from '@/types/pathnames';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import { usePatient } from '@/components/hooks/data';
import BirthDayPicker from '@/components/screens/BirthDayPicker';
import Router from 'next/router';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import getConfig from '../../../config';
import { useVWO } from '@/context/VWOContext';

const siteName = getConfig(
  process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
).name;

const AgeScreen = () => {
  const { specificCare, variant, potentialInsurance } = useIntakeState();
  const { push, query } = Router;
  const { addSpecificCare, addPotentialInsurance, addVariant } =
    useIntakeActions();
  const { data: patient } = usePatient();
  const vwoContext = useVWO();

  useEffect(() => {
    if (specificCare && specificCare == 'Weight loss') {
      window.freshpaint?.track('weight-loss-age-screen');
    }
  }, [specificCare]);

  useEffect(() => {
    window.freshpaint?.track('age-screen');
  }, []);

  const activateVariant = async () => {
    if (
      patient &&
      specificCare === SpecificCareOption.WEIGHT_LOSS &&
      ![
        PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
        PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
        PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
      ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT) &&
      ['AR', 'CO', 'GA', 'MA', 'MI', 'NJ', 'CA', 'FL', 'IL'].includes(
        patient.region || ''
      )
    ) {
      await vwoContext.activateBefore('9363', {
        userId: patient?.profile_id || '',
        patientId: patient?.id,
        firstName: patient?.profiles.first_name!,
        lastName: patient?.profiles.last_name!,
      });
    }
  };

  useEffect(() => {
    activateVariant();
  }, [patient]);

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

    console.log(query.care, 'querycare');
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

  return (
    <>
      <Head>
        <title>{siteName} | Onboarding | Enter Date of Birth</title>
      </Head>
      <Container maxWidth="sm">
        <BirthDayPicker nextPage={Pathnames.COMPLETE_PROFILE} />
      </Container>
    </>
  );
};

export const getServerSideProps = getAuthProps;

AgeScreen.getLayout = (page: ReactElement) => {
  return (
    <OnboardingLayout
      back={
        siteName === 'Zealthy' || siteName === 'FitRx'
          ? Pathnames.REGION_SCREEN
          : Pathnames.REGION_SCREEN_ZP
      }
    >
      {page}
    </OnboardingLayout>
  );
};

export default AgeScreen;
