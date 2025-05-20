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

const ED5440HomeAd = () => {
  const { addSpecificCare, addVariant, addPotentialInsurance } =
    useIntakeActions();
  const { resetQuestionnaires } = useVisitActions();
  const { specificCare } = useIntakeState();
  const { query, isReady } = useRouter();

  useEffect(() => {
    resetQuestionnaires();
    addSpecificCare(SpecificCareOption.ERECTILE_DYSFUNCTION);
    addVariant('5440');
    if (specificCare === SpecificCareOption.ERECTILE_DYSFUNCTION) {
      if (isReady) {
        Router.push({
          pathname: Pathnames.ED_TRANSITION_1,
          query: {
            care: SpecificCareOption.ERECTILE_DYSFUNCTION,
            variant: '5440',
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

ED5440HomeAd.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default ED5440HomeAd;
