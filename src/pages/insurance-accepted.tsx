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

const AetnaMentalHealthHome = () => {
  const { addSpecificCare, addPotentialInsurance } = useIntakeActions();
  const { addHasInsurance } = useInsuranceActions();
  const { resetQuestionnaires } = useVisitActions();

  useEffect(() => {
    resetQuestionnaires();
    addSpecificCare(SpecificCareOption.PRIMARY_CARE);
    addPotentialInsurance(PotentialInsuranceOption.OUT_OF_NETWORK);
    addHasInsurance(true);
    Router.push({
      pathname: Pathnames.GET_STARTED,
      query: {
        ins: PotentialInsuranceOption.OUT_OF_NETWORK,
      },
    });
  }, [addSpecificCare]);

  return (
    <>
      <Head>
        <title>Insurance with Zealthy</title>
      </Head>
    </>
  );
};

AetnaMentalHealthHome.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default AetnaMentalHealthHome;
