import Head from 'next/head';
import { getAuthProps } from '@/lib/auth';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement, useEffect, useState } from 'react';
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
import { mapMentalHealthFollowupToQuestionnaires } from '@/utils/mapMentalHealthFollowupToQuestionnaires';
import { Box, Button, Typography } from '@mui/material';
import Loading from '@/components/shared/Loading/Loading';
import {
  usePatient,
  useDaysSinceLastAppointment,
} from '@/components/hooks/data';

const Followup = () => {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const { createOnlineVisit } = useVisitAsync();
  const { addQuestionnaires, resetQuestionnaires, addCare } = useVisitActions();
  const [loading, setLoading] = useState<boolean>(true);
  const [isPsychiatry, setIsPsychiatry] = useState<boolean>(false);
  const { data: days = 76 } = useDaysSinceLastAppointment(
    'Anxiety or depression'
  );

  useEffect(() => {
    if (days && days < 75)
      Router.push('/patient-portal/mental-health/visit-not-due');
  }, [days]);

  const questionnaireName = useVisitSelect(
    visit => visit.questionnaires?.[0]?.name
  );

  const createMentalHealthVisit = async () => {
    if (!patient?.id) {
      return;
    }
    const psychiatry = await supabase
      .from('patient_subscription')
      .select(`*, subscription (*)`)
      .eq('patient_id', patient?.id)
      .eq('status', 'active')
      .eq('subscription_id', 7)
      .single()
      .then(({ data }) => data);
    console.info(JSON.stringify(psychiatry));
    if (psychiatry?.reference_id) {
      setIsPsychiatry(true);
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
      addQuestionnaires(mapMentalHealthFollowupToQuestionnaires());
      setLoading(false);
    } else {
      setIsPsychiatry(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patient?.id) {
      createMentalHealthVisit();
    }
  }, [patient?.id]);

  return (
    <>
      <Head>
        <title>Zealthy | Mental Health Follow Up</title>
      </Head>
      <CenteredContainer maxWidth="xs">
        {loading && !isPsychiatry && <Loading />}
        {!loading && !isPsychiatry && (
          <>
            <Box>
              <Typography variant="h2" mb="4rem">
                You do not have a Zealthy psychiatric subscription. Please
                schedule a visit at link below.
              </Typography>
              <Button
                fullWidth
                sx={{ marginBottom: '1.5rem' }}
                onClick={() =>
                  Router.push(Pathnames.PATIENT_PORTAL_SCHEDULE_VISIT)
                }
              >
                Schedule visit
              </Button>
              <Button
                fullWidth
                color="grey"
                onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}
              >
                Go home
              </Button>
            </Box>
          </>
        )}
        {!loading && isPsychiatry && (
          <>
            <Box>
              <Typography variant="h2" mb="1rem">
                {`You're in the right place!`}
              </Typography>
              <Typography variant="body1" mb="1.5rem">
                {`Answer a few questions so that your provider knows how you’re
                feeling and if you’ve made progress.`}
              </Typography>
              <Typography variant="body1" mb="4rem">
                {`You’ll then be able to schedule a follow-up visit with your
                psychiatric provider, which is included in your membership.`}
              </Typography>
              <Button
                fullWidth
                onClick={() =>
                  Router.push(
                    `${Pathnames.PATIENT_PORTAL}/${Pathnames.QUESTIONNAIRES}/${questionnaireName}/44250-9`
                  )
                }
              >
                Continue
              </Button>
            </Box>
          </>
        )}
      </CenteredContainer>
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

Followup.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default Followup;
