import Head from 'next/head';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import { ReactElement, useEffect } from 'react';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useVisitActions } from '@/components/hooks/useVisit';

const BirthControlHome = () => {
  const { addSpecificCare } = useIntakeActions();
  const { resetQuestionnaires } = useVisitActions();
  const { specificCare } = useIntakeState();

  useEffect(() => {
    resetQuestionnaires();
    addSpecificCare(SpecificCareOption.BIRTH_CONTROL);
    if (specificCare === SpecificCareOption.BIRTH_CONTROL) {
      Router.push(Pathnames.GET_STARTED);
    }
  }, [addSpecificCare, specificCare, resetQuestionnaires]);

  return (
    <>
      <Head>
        <title>Birth Control | Zealthy</title>
      </Head>
    </>
  );
};

BirthControlHome.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default BirthControlHome;
