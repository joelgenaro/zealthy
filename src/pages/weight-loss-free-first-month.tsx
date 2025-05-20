import Head from 'next/head';
import { ReactElement, useEffect } from 'react';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import Router from 'next/router';
import { useIntakeActions } from '@/components/hooks/useIntake';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { Pathnames } from '@/types/pathnames';
import { useVisitActions } from '@/components/hooks/useVisit';

const WeightLossFirstMonthFreeHome = () => {
  const { addSpecificCare, addPotentialInsurance } = useIntakeActions();
  const { resetQuestionnaires } = useVisitActions();

  useEffect(() => {
    resetQuestionnaires();
    addSpecificCare(SpecificCareOption.WEIGHT_LOSS);
    addPotentialInsurance(PotentialInsuranceOption.FIRST_MONTH_FREE);
    Router.push({
      pathname: Pathnames.GET_STARTED,
      query: {
        care: SpecificCareOption.WEIGHT_LOSS,
        ins: PotentialInsuranceOption.FIRST_MONTH_FREE,
      },
    });
  }, [addSpecificCare, addPotentialInsurance, resetQuestionnaires]);

  return (
    <>
      <Head>
        <title>Medicare Access with Zealthy</title>
      </Head>
    </>
  );
};

WeightLossFirstMonthFreeHome.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default WeightLossFirstMonthFreeHome;
