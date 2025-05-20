import Head from 'next/head';
import { ReactElement, useEffect } from 'react';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import Router from 'next/router';
import { useIntakeActions } from '@/components/hooks/useIntake';
import {
  SpecificCareOption,
  PotentialInsuranceOption,
} from '@/context/AppContext/reducers/types/intake';
import { Pathnames } from '@/types/pathnames';
import { useVisitActions } from '@/components/hooks/useVisit';
import { useInsuranceActions } from '@/components/hooks/useInsurance';

const IllinoisInsuranceHome = () => {
  const { addSpecificCare, addPotentialInsurance } = useIntakeActions();
  const { addHasInsurance } = useInsuranceActions();
  const { resetQuestionnaires } = useVisitActions();

  useEffect(() => {
    resetQuestionnaires();
    addSpecificCare(SpecificCareOption.PRIMARY_CARE);
    addPotentialInsurance(PotentialInsuranceOption.BLUE_CROSS_ILLINOIS);
    addHasInsurance(true);
    Router.push({
      pathname: Pathnames.GET_STARTED,
      query: {
        care: SpecificCareOption.PRIMARY_CARE,
        ins: PotentialInsuranceOption.BLUE_CROSS_ILLINOIS,
      },
    });
  }, [
    addSpecificCare,
    addHasInsurance,
    addPotentialInsurance,
    resetQuestionnaires,
  ]);

  return (
    <>
      <Head>
        <title>Insurance with Zealthy</title>
      </Head>
    </>
  );
};

IllinoisInsuranceHome.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default IllinoisInsuranceHome;
