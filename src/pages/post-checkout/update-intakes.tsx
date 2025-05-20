import Head from 'next/head';
import { ReactElement, useEffect } from 'react';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { getAuthProps } from '@/lib/auth';

import Loading from '@/components/shared/Loading/Loading';
import { useSelector } from '@/components/hooks/useSelector';
import { useVisitAsync } from '@/components/hooks/useVisit';
import { IntakeType } from '@/utils/getIntakesForVisit';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';

const UpdateVisitIntakes = () => {
  const visitId = useSelector(store => store.visit.id);
  const { updateOnlineVisit, fetchVisitById } = useVisitAsync();

  useEffect(() => {
    const getIntakes = async (visitId: number) => {
      return fetchVisitById(visitId).then(({ data, error }) => {
        if (error) {
          console.error(error);
          return;
        }

        return (
          data?.intakes
            .map((intake: any) => intake as IntakeType)
            .filter((intake: any) => Boolean(intake.entry))
            // filter out ILV specific questionnaires
            .filter(
              (intake: any) =>
                ![
                  'instant-live-visit-end',
                  'instant-live-visit-start',
                ].includes(intake.name)
            )
        );
      });
    };

    if (visitId) {
      getIntakes(visitId)
        .then(intakes => {
          return updateOnlineVisit({
            intakes,
          });
        })
        .then(() => Router.push(Pathnames.POST_CHECKOUT_INTAKES));
    }
  }, [fetchVisitById, updateOnlineVisit, visitId]);

  return (
    <>
      <Head>
        <title>Update Visit | Zealthy</title>
      </Head>
      <Loading />
    </>
  );
};

export const getServerSideProps = getAuthProps;

UpdateVisitIntakes.getLayout = (page: ReactElement) => (
  <OnboardingLayout>{page}</OnboardingLayout>
);

export default UpdateVisitIntakes;
