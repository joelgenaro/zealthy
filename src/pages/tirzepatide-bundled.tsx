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

const TirzepatideBundleHome = () => {
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
      window.freshpaint?.track('weight-loss-tirzepatide-bundle');
      addPotentialInsurance(PotentialInsuranceOption.TIRZEPATIDE_BUNDLED);

      if (variant) {
        addVariant(variant);
        Router.push({
          pathname: Pathnames.GET_STARTED,
          query: {
            ins: PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
            care: SpecificCareOption.WEIGHT_LOSS,
            variant,
          },
        });
      } else {
        Router.push({
          pathname: Pathnames.GET_STARTED,
          query: {
            ins: PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
            care: SpecificCareOption.WEIGHT_LOSS,
          },
        });
      }
    }
  }, [
    addSpecificCare,
    specificCare,
    resetQuestionnaires,
    searchParams,
    addPotentialInsurance,
    addVariant,
  ]);

  return (
    <>
      <Head>
        <title>Treat Weight Loss with Tirzepatide through Zealthy</title>
      </Head>
    </>
  );
};

TirzepatideBundleHome.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default TirzepatideBundleHome;
