import Head from 'next/head';
import { ReactElement } from 'react';
import { getAuthProps } from '@/lib/auth';
import ScheduleCoach from '@/components/screens/PatientPortal/components/ScheduleCoach';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import { useRouter } from 'next/router';
import { CarePersonType, CoachType } from '@/types/carePersonType';

const ScheduleCoachPage = () => {
  const router = useRouter();
  const { coach } = router.query;

  const coachType: { [key: string]: CoachType } = {
    'mental-health': CarePersonType.MENTAL_HEALTH,
    'weight-loss': CarePersonType.WEIGHT_LOSS,
  };

  return (
    <>
      <Head>
        <title>Schedule Visit | Zealthy</title>
      </Head>
      <ScheduleCoach coachType={coachType[coach as CoachType]} />
    </>
  );
};

export const getServerSideProps = getAuthProps;

ScheduleCoachPage.getLayout = (page: ReactElement) => (
  <PatientPortalNav>{page}</PatientPortalNav>
);

export default ScheduleCoachPage;
