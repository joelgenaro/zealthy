import Head from 'next/head';
import Router from 'next/router';
import { ReactElement, useEffect } from 'react';
import { Pathnames } from '@/types/pathnames';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useVisitActions } from '@/components/hooks/useVisit';
import { useLanguage } from '@/components/hooks/data';

const WeightLossNoCoachHome = () => {
  const { addSpecificCare, addVariant } = useIntakeActions();
  const { resetQuestionnaires } = useVisitActions();
  const { specificCare } = useIntakeState();
  const lan = useLanguage();

  useEffect(() => {
    resetQuestionnaires();
    addVariant('3055');
    addSpecificCare(SpecificCareOption.WEIGHT_LOSS);
    if (specificCare === SpecificCareOption.WEIGHT_LOSS) {
      window.freshpaint?.track('weight-loss-start');

      Router.push({
        pathname: Pathnames.GET_STARTED,
        query: {
          care: SpecificCareOption.WEIGHT_LOSS,
          variant: '3055',
        },
      });
    }
  }, [addSpecificCare, specificCare, resetQuestionnaires, addVariant]);

  return (
    <>
      <Head>
        <title>Weight Loss with Zealthy</title>
      </Head>
    </>
  );
};

WeightLossNoCoachHome.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default WeightLossNoCoachHome;
