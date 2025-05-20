import Head from 'next/head';
import { ReactElement } from 'react';
import RateCoach from '@/components/screens/PatientPortal/components/RateCoach';
import { getAuthProps } from '@/lib/auth';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import { useRouter } from 'next/router';

const RateCoachPage = () => {
  const router = useRouter();
  const { type } = router.query;

  return (
    <>
      <Head>
        <title>Rate Your Coach | Zealthy</title>
      </Head>
      <>
        <RateCoach coachPath={type as string} />
      </>
    </>
  );
};

export const getServerSideProps = getAuthProps;

RateCoachPage.getLayout = (page: ReactElement) => (
  <PatientPortalNav>{page}</PatientPortalNav>
);

export default RateCoachPage;
