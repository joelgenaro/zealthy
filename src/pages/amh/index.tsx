import Head from 'next/head';
import { ReactElement, useEffect } from 'react';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import Router from 'next/router';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { Pathnames } from '@/types/pathnames';
import { useVisitActions } from '@/components/hooks/useVisit';

const AsyncMentalHealthHome = () => {
  const { addSpecificCare } = useIntakeActions();
  const { resetQuestionnaires } = useVisitActions();
  const { specificCare } = useIntakeState();

  useEffect(() => {
    resetQuestionnaires();
    addSpecificCare(SpecificCareOption.ASYNC_MENTAL_HEALTH);
    if (specificCare === SpecificCareOption.ASYNC_MENTAL_HEALTH) {
      Router.push(Pathnames.GET_STARTED);
    }
  }, [addSpecificCare, specificCare, resetQuestionnaires]);

  return (
    <>
      <Head>
        <title>Asynchronous Mental Health with Zealthy</title>
      </Head>
    </>
  );
};

AsyncMentalHealthHome.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default AsyncMentalHealthHome;
