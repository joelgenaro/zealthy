import Head from 'next/head';
import { ReactElement } from 'react';
import { getAuthProps } from '@/lib/auth';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import Router from 'next/router';
import { Box, Button, Typography } from '@mui/material';
import { Pathnames } from '@/types/pathnames';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import { useLanguage } from '@/components/hooks/data';

const MentalCoachPage = () => {
  const language = useLanguage();
  return (
    <CenteredContainer maxWidth="xs">
      <Head>
        <title>Mental Health Coaching Sign Up | Zealthy</title>
      </Head>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Typography
          textAlign={'left'}
          variant="h2"
          sx={{
            fontSize: '32px',
            fontWeight: '700',
            lineHeight: '38px',
          }}
        >
          {
            'Zealthy mental health coaches are well trained to supplement your psychiatric care.'
          }
        </Typography>
        <Typography fontWeight={300}>
          {
            'We can match you to a coach, who will work directly with your provider to ensure that any appropriately prescribed medication is supplemented by the right emotional support.'
          }
        </Typography>
        <Typography fontWeight={300} mb="3rem">
          {
            'You will be able to hold monthly 45-minute sessions with your coach and message them between sessions in your Zealthy portal.'
          }
        </Typography>
        <Button
          onClick={() =>
            Router.push(Pathnames.PATIENT_PORTAL_MENTAL_COACH_DETAILS)
          }
        >
          {language === 'esp' ? 'Cuentame mas' : 'Tell me more'}
        </Button>
      </Box>
    </CenteredContainer>
  );
};

export const getServerSideProps = getAuthProps;

MentalCoachPage.getLayout = (page: ReactElement) => (
  <PatientPortalNav>{page}</PatientPortalNav>
);

export default MentalCoachPage;
