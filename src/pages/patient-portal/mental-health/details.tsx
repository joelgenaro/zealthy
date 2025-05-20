import Head from 'next/head';
import { ReactElement } from 'react';
import { getAuthProps } from '@/lib/auth';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import Router from 'next/router';
import { Button, Box, Typography } from '@mui/material';
import { Pathnames } from '@/types/pathnames';
import MentalHealthZealthyProgram from '@/components/screens/Question/components/MentalHealthZealthyProgram';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';

const MentalCoachDetailsPage = () => {
  return (
    <CenteredContainer maxWidth="xs">
      <Head>
        <title>Mental Health Coaching Details | Zealthy</title>
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
            '9/10 members report that they benefited from working with a Zealthy mental health coach.'
          }
        </Typography>
        <Typography fontWeight={300}>
          {
            'At Zealthy, we know that healing really happens through compassionate and ongoing support. '
          }
        </Typography>
        <MentalHealthZealthyProgram />
        <Button
          sx={{ marginTop: '3rem' }}
          onClick={() =>
            Router.push(Pathnames.PATIENT_PORTAL_MENTAL_COACH_PLAN)
          }
        >
          {'Continue'}
        </Button>
      </Box>
    </CenteredContainer>
  );
};

export const getServerSideProps = getAuthProps;

MentalCoachDetailsPage.getLayout = (page: ReactElement) => (
  <PatientPortalNav>{page}</PatientPortalNav>
);

export default MentalCoachDetailsPage;
