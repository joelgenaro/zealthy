import Head from 'next/head';
import { ReactElement, useEffect } from 'react';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useVisitActions } from '@/components/hooks/useVisit';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';
import NavBarLayout from '@/layouts/NavBarLayout';

const HairLossHome = () => {
  const { addSpecificCare } = useIntakeActions();
  const { resetQuestionnaires } = useVisitActions();
  const { specificCare } = useIntakeState();

  useEffect(() => {
    resetQuestionnaires();
    addSpecificCare(SpecificCareOption.HAIR_LOSS);
    if (specificCare === SpecificCareOption.HAIR_LOSS) {
      Router.push(Pathnames.GET_STARTED);
    }
  }, [addSpecificCare, resetQuestionnaires, specificCare]);

  return (
    <>
      <Head>
        <title>Treat Hair Loss with Zealthy</title>
      </Head>
    </>
  );
};

HairLossHome.getLayout = (page: ReactElement) => {
  return <NavBarLayout>{page}</NavBarLayout>;
};

export default HairLossHome;
