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

const WeightLossSyncHome = () => {
  const { addSpecificCare, addPotentialInsurance } = useIntakeActions();
  const { resetQuestionnaires } = useVisitActions();
  const { specificCare } = useIntakeState();

  useEffect(() => {
    resetQuestionnaires();
    addSpecificCare(SpecificCareOption.WEIGHT_LOSS);
    if (specificCare === SpecificCareOption.WEIGHT_LOSS) {
      window.freshpaint?.track('weight-loss-sync-start');
      addPotentialInsurance(PotentialInsuranceOption.WEIGHT_LOSS_SYNC);
      Router.push(Pathnames.GET_STARTED);
    }
  }, [addSpecificCare, specificCare, resetQuestionnaires]);

  return (
    <>
      <Head>
        <title>Treat Weight Loss with Zealthy Synchronously</title>
      </Head>
    </>
  );
};

WeightLossSyncHome.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default WeightLossSyncHome;
