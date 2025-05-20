import { useVWOVariationName } from '@/components/hooks/data';
import { useVisitSelect } from '@/components/hooks/useVisit';
import Loading from '@/components/shared/Loading/Loading';
import { useIntakeState } from '@/components/hooks/useIntake';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { getAuthProps } from '@/lib/auth';
import { envMapping } from '@/questionnaires';
import { Pathnames } from '@/types/pathnames';
import Head from 'next/head';
import Router from 'next/router';
import { ReactElement, useEffect } from 'react';
import getConfig from '../../../../config';

const QuestionnairePage = () => {
  const intake = useVisitSelect(
    visit => visit.intakes.filter(i => i.entry !== null)[0]
  );
  const { variant } = useIntakeState();
  const intro = envMapping[intake?.name]?.intro;
  const variation6822 = useVWOVariationName('6822');

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  useEffect(() => {
    if (intro) {
      Router.push(`${Pathnames.POST_CHECKOUT_INTAKES}/${intake.name}`);
    } else if (intake?.entry) {
      Router.push(
        `${Pathnames.POST_CHECKOUT_INTAKES}/${intake.name}/${intake.entry}`
      );
    } else {
      Router.push(Pathnames.POST_CHECKOUT_COMPLETE_VISIT);
    }
  }, [intake?.entry, intake?.name, intro]);

  return (
    <>
      <Head>
        <title>{siteName}</title>
      </Head>
      <Loading />
    </>
  );
};

export const getServerSideProps = getAuthProps;
QuestionnairePage.getLayout = (page: ReactElement) => (
  <OnboardingLayout>{page}</OnboardingLayout>
);

export default QuestionnairePage;
