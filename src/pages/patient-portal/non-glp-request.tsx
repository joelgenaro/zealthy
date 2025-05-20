import Head from 'next/head';
import Router from 'next/router';
import { Container, Stack } from '@mui/material';
import { ReactElement, useEffect, useState } from 'react';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import { useVisitActions } from '@/components/hooks/useVisit';
import { mapNonGlp1MedsToQuestionnaires } from '@/utils/mapNonGlp1MedsToQuestionnaires';
import Loading from '@/components/shared/Loading/Loading';
import { usePatient } from '@/components/hooks/data';
import { useCreateOnlineVisitAndNavigate } from '@/components/hooks/useCreateOnlineVisitAndNavigate';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { Pathnames } from '@/types/pathnames';
import { getAuthProps } from '@/lib/auth';

const NonGLP1RequestPage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { data: patient } = usePatient();
  const createVisitAndNavigateAway = useCreateOnlineVisitAndNavigate(
    patient?.id
  );
  const { addQuestionnaires, resetQuestionnaires } = useVisitActions();

  async function createVisit() {
    resetQuestionnaires();
    await createVisitAndNavigateAway([SpecificCareOption.OTHER], {
      navigateAway: false,
    });
    addQuestionnaires(mapNonGlp1MedsToQuestionnaires('Request'));
  }

  useEffect(() => {
    if (patient?.id) {
      createVisit();
    }
    setLoading(false);
  }, [patient?.id]);

  useEffect(() => {
    if (!loading && patient?.id) {
      Router.replace(
        `${Pathnames.PATIENT_PORTAL}/weight-loss-treatment/non-glp`
      );
    }
  }, [loading, patient?.id]);

  return (
    <>
      <Head>
        <title>Non-GLP1 Medication Request | Zealthy</title>
      </Head>
      <Container style={{ maxWidth: '500px' }}>
        {loading ? <Loading /> : <Stack gap={6}></Stack>}
      </Container>
    </>
  );
};

export const getServerSideProps = getAuthProps;

NonGLP1RequestPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default NonGLP1RequestPage;
