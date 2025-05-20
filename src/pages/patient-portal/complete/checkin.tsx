import Head from 'next/head';
import Router from 'next/router';
import { ReactElement, useEffect, useState } from 'react';
import { getAuthProps } from '@/lib/auth';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { Pathnames } from '@/types/pathnames';
import Loading from '@/components/shared/Loading/Loading';
import { Box, Button, Typography } from '@mui/material';
import { useQuestionnaireResponses } from '@/components/hooks/useQuestionnaireResponses';
import { useVisitAsync } from '@/components/hooks/useVisit';

const CheckInComplete = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const submitQuestionnaireResponses = useQuestionnaireResponses();
  const { updateOnlineVisit } = useVisitAsync();

  const completeVisit = async () => {
    await submitQuestionnaireResponses()
      .then(() => {})
      .catch(error => {
        console.error('check_in_complete_err', error);
      });
    await updateOnlineVisit({
      status: 'Completed',
      intakes: [],
      completed_at: new Date().toISOString(),
    });
    setLoading(false);
  };

  const handleGoHome = () => {
    Router.push(Pathnames.PATIENT_PORTAL);
  };

  useEffect(() => {
    completeVisit();
  }, []);

  return (
    <>
      <Head>
        <title>Zealthy | Lab Work</title>
      </Head>
      <CenteredContainer maxWidth="xs" sx={{ marginBottom: '24px' }}>
        {loading && <Loading />}
        {!loading && (
          <Box>
            <Typography variant="h2" sx={{ marginBottom: '8px' }}>
              {'Thank you for completing your check-in!'}
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: '48px' }}>
              {
                "Congratulations; you're one step closer to meeting your goals and getting healthy with Zealthy"
              }
            </Typography>
            <Button type="button" onClick={handleGoHome} sx={{ width: '100%' }}>
              {'Go back home'}
            </Button>
          </Box>
        )}
      </CenteredContainer>
    </>
  );
};

export const getServerSideProps = getAuthProps;

CheckInComplete.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default CheckInComplete;
