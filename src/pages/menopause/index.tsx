import Head from 'next/head';
import { ReactElement, useEffect } from 'react';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useVisitActions } from '@/components/hooks/useVisit';
import { useRouter } from 'next/router';
import { Pathnames } from '@/types/pathnames';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';

const MenopauseHome = () => {
  const { addSpecificCare } = useIntakeActions();
  const { resetQuestionnaires } = useVisitActions();
  const { specificCare } = useIntakeState();
  const router = useRouter();

  useEffect(() => {
    resetQuestionnaires();
    addSpecificCare(SpecificCareOption.MENOPAUSE);
    if (specificCare === SpecificCareOption.MENOPAUSE) {
      router.push(Pathnames.GET_STARTED);
    }
  }, [addSpecificCare, specificCare, resetQuestionnaires]);

  return (
    <>
      <Head>
        <title>Menopause | Zealthy</title>
      </Head>
    </>
  );
};

MenopauseHome.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default MenopauseHome;
