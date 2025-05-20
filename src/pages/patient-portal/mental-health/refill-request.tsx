import Head from 'next/head';
import { getAuthProps } from '@/lib/auth';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { usePatient } from '@/components/hooks/data';
import { useCreateOnlineVisitAndNavigate } from '@/components/hooks/useCreateOnlineVisitAndNavigate';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';

const RefillRequestPS = () => {
  const { data: patient } = usePatient();
  const createVisitAndNavigateAway = useCreateOnlineVisitAndNavigate(
    patient?.id
  );

  return (
    <>
      <Head>
        <title>Zealthy | Mental Health Check-in</title>
      </Head>
      <CenteredContainer maxWidth="sm">
        <Box>
          <Typography variant="h2" mb="1rem">
            {`You're in the right place!`}
          </Typography>
          <Typography variant="body1" mb="1.5rem">
            {`Answer a few questions so that your provider knows how you’re
                feeling and if you’ve made progress.`}
          </Typography>
          <Typography variant="body1" mb="4rem">
            {`Your provider will review your prescription request once you complete the following questions.`}
          </Typography>
          <Button
            fullWidth
            onClick={() => {
              createVisitAndNavigateAway(
                [SpecificCareOption.ANXIETY_OR_DEPRESSION],
                {
                  careType:
                    PotentialInsuranceOption.MENTAL_HEALTH_REFILL_REQUEST,
                }
              );
            }}
          >
            Continue
          </Button>
        </Box>
      </CenteredContainer>
    </>
  );
};

export const getServerSideProps = getAuthProps;

RefillRequestPS.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default RefillRequestPS;
