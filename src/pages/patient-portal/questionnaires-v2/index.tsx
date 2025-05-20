import Head from 'next/head';
import Router from 'next/router';
import { ReactElement, useEffect } from 'react';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import Loading from '@/components/shared/Loading/Loading';
import { getAuthProps } from '@/lib/auth';
import { Pathnames } from '@/types/pathnames';
import { useVisitSelect } from '@/components/hooks/useVisit';
import getConfig from '../../../../config';

const QuestionnairePage = () => {
  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  const ques = useVisitSelect(
    visit => visit.questionnaires.filter(i => i.entry !== null)[0]
  );

  useEffect(() => {
    if (ques.name) {
      Router.push(`${Pathnames.PATIENT_PORTAL_QUESTIONNAIRES}/${ques.name}`);
    } else {
      Router.push(Pathnames.PATIENT_PORTAL);
    }
  }, [ques.name]);

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
  <PatientPortalNav>{page}</PatientPortalNav>
);

export default QuestionnairePage;
