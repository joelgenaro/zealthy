import Head from 'next/head';
import { ReactElement, useEffect } from 'react';
import Loading from '@/components/shared/Loading/Loading';
import NoNavLayout from '@/layouts/NoNavLayout';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

function LogOut() {
  const supabaseClient = useSupabaseClient();

  useEffect(() => {
    supabaseClient.auth.signOut().then(() => {
      // Clear all session storage
      sessionStorage.clear();

      // Clear localStorage items related to modals
      localStorage.removeItem('lastModalClosedTime');
      localStorage.removeItem('lastSkipTime');
      localStorage.removeItem('vwoVariations');

      // Clear all sesion storage
      sessionStorage.removeItem('displayedVIDModal');
      sessionStorage.removeItem('skipOrderRating');
      sessionStorage.removeItem('bbbModalClosedAt');
      sessionStorage.removeItem('weight-loss-flow');
      sessionStorage.removeItem('patientHeight');
      sessionStorage.removeItem('patientWeight');
      sessionStorage.removeItem('patientBMI');
      sessionStorage.removeItem('patientHeightFt');
      sessionStorage.removeItem('patientHeightIn');
      sessionStorage.removeItem('shownExclusiveOffer');
      sessionStorage.removeItem('shownModalsInSession');
      sessionStorage.removeItem('modalsShownInSession');
      sessionStorage.removeItem('lastShownUnseenMessagesCount');
      sessionStorage.removeItem('hasShownVIDModal');
      sessionStorage.removeItem('feedbackChecked');

      setTimeout(() => {
        Router.push(Pathnames.LOG_IN);
      }, 1000);
    });
  }, [supabaseClient]);

  return (
    <>
      <Head>
        <title>Zealthy | Log Out</title>
      </Head>
      <Container maxWidth="sm">
        <Stack gap={4} style={{ height: '50vh' }} justifyContent="center">
          <Loading />
          <Typography textAlign="center" variant="h3">
            Securely logging you out.
          </Typography>
        </Stack>
      </Container>
    </>
  );
}

LogOut.getLayout = (page: ReactElement) => {
  return <NoNavLayout>{page}</NoNavLayout>;
};

export default LogOut;
