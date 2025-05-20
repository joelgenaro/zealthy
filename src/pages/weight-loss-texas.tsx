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
import { useLanguage } from '@/components/hooks/data';

const WeightLossTexasHome = () => {
  const { addSpecificCare, addPotentialInsurance } = useIntakeActions();
  const { resetQuestionnaires } = useVisitActions();
  const { specificCare } = useIntakeState();
  const lan = useLanguage();

  useEffect(() => {
    resetQuestionnaires();
    addSpecificCare(SpecificCareOption.WEIGHT_LOSS);
    if (specificCare === SpecificCareOption.WEIGHT_LOSS) {
      window.freshpaint?.track('weight-loss-start');

      addPotentialInsurance(PotentialInsuranceOption.TX);
      Router.push(Pathnames.GET_STARTED);
    }
  }, [addSpecificCare, specificCare, resetQuestionnaires]);

  return (
    <>
      <Head>
        <title>Treat Weight Loss with Zealthy in Texas</title>
      </Head>
    </>
  );
};

WeightLossTexasHome.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default WeightLossTexasHome;
