import Head from 'next/head';
import { ReactElement, useEffect, useMemo } from 'react';
import PatientProfile from '@/components/screens/PatientProfile';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { getAuthProps } from '@/lib/auth';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import getConfig from '../../../config';

type QueryString = {
  care?: string;
  ins?: string;
  variant?: string;
};

const CompleteProfile = () => {
  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  const { query } = Router;
  const { specificCare, potentialInsurance, variant } = useIntakeState();
  const { addSpecificCare, addPotentialInsurance, addVariant } =
    useIntakeActions();

  const care = useMemo(() => {
    if (!query || !query.care) return specificCare;

    return query.care as SpecificCareOption;
  }, [query, specificCare]);

  const ins = useMemo(() => {
    if (!query || !query.ins) return potentialInsurance;
    return query.ins as PotentialInsuranceOption;
  }, [potentialInsurance, query]);

  const va = useMemo(() => {
    if (!query || !query.variant) return variant;
    return query.variant as string;
  }, [query, variant]);

  useEffect(() => {
    if (care) {
      addSpecificCare(care);
    }

    addPotentialInsurance(ins);

    addVariant(va);
  }, [addSpecificCare, addPotentialInsurance, addVariant, care, ins, va]);

  useEffect(() => {
    const query: QueryString = {};

    if (specificCare) {
      query.care = specificCare;
    }

    if (potentialInsurance) {
      query.ins = potentialInsurance;
    }

    if (variant) {
      query.variant = variant;
    }

    Router.push(
      {
        query,
      },
      undefined,
      { shallow: true }
    );

    return;
  }, [potentialInsurance, specificCare, variant]);

  return (
    <>
      <Head>
        <title>Complete Profile | Onboarding | {siteName}</title>
      </Head>

      <PatientProfile />
    </>
  );
};

export const getServerSideProps = getAuthProps;

CompleteProfile.getLayout = (page: ReactElement) => {
  return (
    <OnboardingLayout back={Pathnames.AGE_SCREEN}>{page}</OnboardingLayout>
  );
};

export default CompleteProfile;
