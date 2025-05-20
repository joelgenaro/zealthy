import Head from 'next/head';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import { ReactElement, useEffect } from 'react';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useVisitActions } from '@/components/hooks/useVisit';
import { usePatient } from '@/components/hooks/data';

const EnclomipheneADHome = () => {
  const { addSpecificCare, addVariant } = useIntakeActions();
  const { resetQuestionnaires } = useVisitActions();
  const { specificCare } = useIntakeState();
  const patient = usePatient();

  useEffect(() => {
    resetQuestionnaires();
    addSpecificCare(SpecificCareOption.ENCLOMIPHENE);
    addVariant('5674-ENCLOM');
    if (specificCare === SpecificCareOption.ENCLOMIPHENE) {
      Router.push(Pathnames.GET_STARTED);
    }
  }, [addSpecificCare, specificCare, resetQuestionnaires]);

  return (
    <>
      <Head>
        <title>Enclomiphene | Zealthy</title>
      </Head>
    </>
  );
};

EnclomipheneADHome.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default EnclomipheneADHome;
