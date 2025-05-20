import Head from 'next/head';
import Image from 'next/image';
import { ReactElement, useEffect } from 'react';
import { Container, Grid, Stack, Typography } from '@mui/material';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { getAuthProps } from '@/lib/auth';
import { Pathnames } from '@/types/pathnames';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import RegionPicker from '@/components/screens/RegionPicker';
import Router from 'next/router';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import SkincareRegionImage from 'public/images/skincare/skincare-eyes.png';

const RegionScreen = () => {
  const isMobile = useIsMobile();
  const { specificCare, potentialInsurance, variant } = useIntakeState();
  const { push, query } = Router;
  const { addSpecificCare, addPotentialInsurance, addVariant } =
    useIntakeActions();

  useEffect(() => {
    const newQuery = {
      care: specificCare || query.care,
      variant: variant || '0',
      ins: potentialInsurance || '',
    };

    // Check if the query parameters need to be updated
    if (
      newQuery.care !== query.care ||
      newQuery.variant !== query.variant ||
      newQuery.ins !== query.ins
    ) {
      push({ query: newQuery }, undefined, { shallow: true });
    }

    // Check before updating the state to avoid unnecessary re-renders
    if (query.care && query.care !== specificCare) {
      addSpecificCare(query.care as SpecificCareOption);
    }
    if (query.ins && query.ins !== potentialInsurance) {
      addPotentialInsurance(query.ins as PotentialInsuranceOption);
    }
    if (query.variant && query.variant !== variant) {
      addVariant(query.variant as string);
    }
  }, [
    query,
    specificCare,
    potentialInsurance,
    variant,
    push,
    addSpecificCare,
    addPotentialInsurance,
    addVariant,
  ]);

  useEffect(() => {
    window.freshpaint?.track('region-screen');
  }, []);

  return (
    <>
      <Head>
        <title>Zealthy | Onboarding | Select State</title>
      </Head>
      <Container maxWidth="sm">
        <Grid container direction="column" gap={isMobile ? 4 : 6}>
          {isMobile ? (
            <Stack margin={'-32px -16px 0 -16px'} height={155}>
              <Image
                quality={100}
                src={SkincareRegionImage.src}
                alt="image of a girl"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Stack>
          ) : null}
          <Grid container direction="column" gap="16px">
            <Typography variant="h2">Healthy skin starts here.</Typography>
            <Typography>
              Please select your state to determine your treatment options.
            </Typography>
          </Grid>
          <RegionPicker nextPage={Pathnames.AGE_SCREEN} />
        </Grid>
      </Container>
    </>
  );
};

export const getServerSideProps = getAuthProps;

RegionScreen.getLayout = (page: ReactElement) => {
  return <OnboardingLayout>{page}</OnboardingLayout>;
};

export default RegionScreen;
