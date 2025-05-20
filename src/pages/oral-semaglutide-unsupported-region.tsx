import Head from 'next/head';
import { ReactElement } from 'react';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { getAuthProps } from '@/lib/auth';
import { Pathnames } from '@/types/pathnames';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import Router from 'next/router';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { useCreateOnlineVisitAndNavigate } from '../components/hooks/useCreateOnlineVisitAndNavigate';
import { usePatient } from '../components/hooks/data';

const OralSemaglutideUnsupportedRegion = () => {
  const { specificCare } = useIntakeState();
  const { data: patient } = usePatient();
  const { addSpecificCare, addPotentialInsurance } = useIntakeActions();
  const createVisitAndNavigateAway = useCreateOnlineVisitAndNavigate(
    patient?.id
  );
  function handleClick() {
    addSpecificCare(SpecificCareOption.WEIGHT_LOSS);
    addPotentialInsurance(PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED);
    createVisitAndNavigateAway([SpecificCareOption.WEIGHT_LOSS]);
  }
  return (
    <>
      <Head>
        <title>Zealthy | Oral Semaglutide | Unsupported Region</title>
        <link rel="preload" href="/fonts" as="font" crossOrigin="" />{' '}
      </Head>
      <Container maxWidth="sm">
        <Typography
          variant={'h2'}
          sx={{
            marginBottom: '1rem',
            fontFamily: 'Georgia',
            fontStyle: 'bold',
            fontWeight: 1000,
            letterSpacing: '0.0015em',
            color: '#1B1B1B',
          }}
        >
          {
            'Your state does not currently support oral semaglutide bundled, but we can offer injectable oral semaglutide bundled for the same price (typically, injectable semaglutide is more expensive) as a courtesy.'
          }
        </Typography>
        <Typography sx={{ marginBottom: '3rem' }}>
          {
            'Please note that injectable semaglutide is typically more effective than oral semaglutide at helping patients with lasting weight loss (patients lose an average of 15% of their body weight). To get your medication, please continue to answer some additional clinical questions. This should take no more than 10 minutes.'
          }
        </Typography>
        <Button fullWidth onClick={handleClick}>
          Continue
        </Button>
      </Container>
    </>
  );
};

export const getServerSideProps = getAuthProps;

OralSemaglutideUnsupportedRegion.getLayout = (page: ReactElement) => (
  <OnboardingLayout back={''}>{page}</OnboardingLayout>
);

export default OralSemaglutideUnsupportedRegion;
