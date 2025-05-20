import Head from 'next/head';
import Router, { useRouter } from 'next/router';
import { ReactElement, useEffect } from 'react';
import { Pathnames } from '@/types/pathnames';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { useVisitActions } from '@/components/hooks/useVisit';

const HardiesHomeAd = () => {
  const { addSpecificCare, addVariant, addPotentialInsurance } =
    useIntakeActions();
  const { resetQuestionnaires } = useVisitActions();
  const { specificCare } = useIntakeState();
  const { query, isReady } = useRouter();

  useEffect(() => {
    resetQuestionnaires();
    addSpecificCare(SpecificCareOption.ERECTILE_DYSFUNCTION);
    addPotentialInsurance(PotentialInsuranceOption.ED_HARDIES);
    addVariant('5674-ED');
    if (specificCare === SpecificCareOption.ERECTILE_DYSFUNCTION) {
      if (isReady) {
        Router.push({
          pathname: Pathnames.ED_TRANSITION_1,
          query: {
            care: SpecificCareOption.ERECTILE_DYSFUNCTION,
            ins: PotentialInsuranceOption.ED_HARDIES,
            variant: '5674-ED',
          },
        });
      }
    }
  }, [
    addSpecificCare,
    addVariant,
    specificCare,
    resetQuestionnaires,
    query,
    isReady,
  ]);

  return (
    <>
      <Head>
        <title>Treat ED with Zealthy</title>
      </Head>
    </>
  );
};

HardiesHomeAd.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default HardiesHomeAd;
