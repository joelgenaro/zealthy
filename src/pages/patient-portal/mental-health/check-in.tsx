import Head from 'next/head';
import { getAuthProps } from '@/lib/auth';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement, useEffect } from 'react';
import Router from 'next/router';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { Pathnames } from '@/types/pathnames';
import {
  useVisitActions,
  useVisitAsync,
  useVisitSelect,
} from '@/components/hooks/useVisit';
import Footer from '@/components/shared/layout/Footer';
import { mapMentalHealthCheckInToQuestionnaires } from '@/utils/mentalHealthCheckInMapCareToQuestionnaire';

const CheckIn = () => {
  const supabase = useSupabaseClient<Database>();
  const { createOnlineVisit } = useVisitAsync();
  const { addQuestionnaires, resetQuestionnaires, addCare } = useVisitActions();
  const questionnaireName = useVisitSelect(
    visit => visit.questionnaires?.[0]?.name
  );

  const createMentalHealthVisit = async () => {
    const reason = await supabase
      .from('reason_for_visit')
      .select('id, reason, synchronous')
      .eq('id', 4);

    addCare({
      care: {
        careSelections: reason.data || [],
        other: '',
      },
    });
    createOnlineVisit();
    resetQuestionnaires();
    addQuestionnaires(mapMentalHealthCheckInToQuestionnaires());
  };

  useEffect(() => {
    if (questionnaireName !== 'phq-9-checkin') {
      createMentalHealthVisit();
    } else {
      Router.push(
        `${Pathnames.PATIENT_PORTAL}/${Pathnames.QUESTIONNAIRES}/${questionnaireName}`
      );
    }
  }, [questionnaireName]);

  return (
    <>
      <Head>
        <title>Zealthy | Mental Health Check-in</title>
      </Head>
      <CenteredContainer maxWidth="sm">
        <></>
      </CenteredContainer>
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

CheckIn.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default CheckIn;
