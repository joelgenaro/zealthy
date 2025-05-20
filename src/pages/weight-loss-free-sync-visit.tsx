import Head from 'next/head';
import Router from 'next/router';
import { ReactElement, useEffect } from 'react';
import { Pathnames } from '@/types/pathnames';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useVisitActions } from '@/components/hooks/useVisit';

const WeightLossFreeSyncVisit = () => {
  const { addSpecificCare } = useIntakeActions();
  const { resetQuestionnaires } = useVisitActions();
  const { specificCare } = useIntakeState();

  useEffect(() => {
    resetQuestionnaires();
    addSpecificCare(SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT);
    if (specificCare === SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT) {
      Router.push(Pathnames.GET_STARTED);
    }
  }, [addSpecificCare, specificCare, resetQuestionnaires]);

  return (
    <>
      <Head>
        <title>Weight Loss Free Consult Visit | Zealthy</title>
      </Head>
    </>
  );
};

WeightLossFreeSyncVisit.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default WeightLossFreeSyncVisit;
