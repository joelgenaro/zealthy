import Head from 'next/head';
import Router from 'next/router';
import { ReactElement, useEffect } from 'react';
import { Pathnames } from '@/types/pathnames';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { useVisitActions } from '@/components/hooks/useVisit';
import { useSearchParams } from 'next/navigation';

const SemaglutideBundleHome = () => {
  const { addSpecificCare, addPotentialInsurance, addVariant } =
    useIntakeActions();
  const { resetQuestionnaires } = useVisitActions();
  const { specificCare } = useIntakeState();
  const searchParams = useSearchParams();

  useEffect(() => {
    resetQuestionnaires();
    addSpecificCare(SpecificCareOption.WEIGHT_LOSS);

    const variant = searchParams?.get('variant');

    if (specificCare === SpecificCareOption.WEIGHT_LOSS) {
      window.freshpaint?.track('weight-loss-semaglutide-bundle');
      addPotentialInsurance(PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED);

      if (variant) {
        addVariant(variant);
        Router.push({
          pathname: Pathnames.GET_STARTED,
          query: {
            care: SpecificCareOption.WEIGHT_LOSS,
            variant,
          },
        });
      } else {
        Router.push(Pathnames.GET_STARTED);
      }
    }
  }, [
    addSpecificCare,
    specificCare,
    resetQuestionnaires,
    addPotentialInsurance,
    addVariant,
    searchParams,
  ]);

  return (
    <>
      <Head>
        <title>Treat Weight Loss with Semaglutide through Zealthy</title>
      </Head>
    </>
  );
};

SemaglutideBundleHome.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default SemaglutideBundleHome;
