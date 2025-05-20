import Head from 'next/head';
import Router from 'next/router';
import { ReactElement, useEffect } from 'react';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { Pathnames } from '@/types/pathnames';
import { useVisitActions } from '@/components/hooks/useVisit';
import { useUser } from '@supabase/auth-helpers-react';

const SkincareTreatmentHome = () => {
  const { addSpecificCare } = useIntakeActions();
  const { resetQuestionnaires } = useVisitActions();
  const { specificCare } = useIntakeState();
  const user = useUser();

  useEffect(() => {
    resetQuestionnaires();
    addSpecificCare(SpecificCareOption.SKINCARE);
    if (specificCare === SpecificCareOption.SKINCARE) {
      if (user) {
        Router.push(Pathnames.SKINCARE_SELECTION);
      } else {
        Router.push(Pathnames.GET_STARTED);
      }
    }
  }, [addSpecificCare, specificCare, resetQuestionnaires, user]);

  return (
    <>
      <Head>
        <title>Skincare Treatment | Zealthy</title>
      </Head>
    </>
  );
};

SkincareTreatmentHome.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default SkincareTreatmentHome;
