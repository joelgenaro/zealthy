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
import { useInsuranceActions } from '@/components/hooks/useInsurance';

const AetnaPrimaryCareHome = () => {
  const { addHasInsurance, addInsuranceProvider } = useInsuranceActions();
  const { addSpecificCare, addPotentialInsurance } = useIntakeActions();
  const { resetQuestionnaires } = useVisitActions();

  useEffect(() => {
    resetQuestionnaires();
    addSpecificCare(SpecificCareOption.PRIMARY_CARE);
    addPotentialInsurance(PotentialInsuranceOption.AETNA);
    addHasInsurance(true);
    Router.push(Pathnames.GET_STARTED);
  }, [addSpecificCare]);

  return (
    <>
      <Head>
        <title>Aetna with Zealthy</title>
      </Head>
    </>
  );
};

AetnaPrimaryCareHome.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default AetnaPrimaryCareHome;
