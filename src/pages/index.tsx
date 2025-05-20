import Head from 'next/head';
import { ReactElement, useEffect } from 'react';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import { useIntakeActions } from '@/components/hooks/useIntake';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import { useVisitActions } from '@/components/hooks/useVisit';
import getConfig from '../../config';

const Home = () => {
  const { addSpecificCare } = useIntakeActions();
  const { updateVisit } = useVisitActions();

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  useEffect(() => {
    addSpecificCare(null);
    updateVisit({
      questionnaires: [],
      selectedCare: {
        careSelections: [],
        other: '',
      },
    });
    Router.push(Pathnames.LOG_IN);
  }, []);

  return (
    <Head>
      <title>{siteName}</title>
    </Head>
  );
};

Home.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default Home;
