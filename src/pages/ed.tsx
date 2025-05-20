import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import { useVisitActions } from '@/components/hooks/useVisit';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import { Pathnames } from '@/types/pathnames';
import Head from 'next/head';
import Router, { useRouter } from 'next/router';
import { ReactElement, useEffect } from 'react';

export const VARIANT_7759 = '7759' as const;

const Variant7759ErectileDisfunctionHome = () => {
  const { addSpecificCare, addVariant, addPotentialInsurance } =
    useIntakeActions();
  const { resetQuestionnaires } = useVisitActions();
  const { specificCare } = useIntakeState();
  const { query, isReady } = useRouter();

  useEffect(() => {
    resetQuestionnaires();
    addSpecificCare(SpecificCareOption.ERECTILE_DYSFUNCTION);
    addVariant(VARIANT_7759);
    if (specificCare === SpecificCareOption.ERECTILE_DYSFUNCTION) {
      if (isReady) {
        Router.push({
          pathname: Pathnames.ED_TRANSITION_1,
          query: {
            care: SpecificCareOption.ERECTILE_DYSFUNCTION,
            variant: VARIANT_7759,
          },
        });
      }
    }
  }, [
    addSpecificCare,
    addVariant,
    specificCare,
    resetQuestionnaires,
    query,
    isReady,
  ]);

  return (
    <>
      <Head>
        <title>Treat ED with Zealthy</title>
      </Head>
    </>
  );
};

Variant7759ErectileDisfunctionHome.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default Variant7759ErectileDisfunctionHome;
