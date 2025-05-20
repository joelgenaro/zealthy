import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Container, Grid, Typography } from '@mui/material';
import { useIntakeSelect, useIntakeState } from '@/components/hooks/useIntake';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { useVisitAsync } from '@/components/hooks/useVisit';

const CareTeam = dynamic(() => import('./components/CareTeam'), {
  ssr: false,
});

const ScheduleVisit = () => {
  const specificCare = useIntakeSelect(intake => intake.specificCare);
  const [open, setOpen] = useState(true);
  const { createOnlineVisit } = useVisitAsync();
  const { potentialInsurance } = useIntakeState();

  useEffect(() => {
    const providerScheduleElement = document.getElementById(
      'provider-schedule-0'
    );

    setTimeout(() => {
      if (providerScheduleElement) {
        // Scroll the element into view
        providerScheduleElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 1000);
  }, [open]);

  async function createVisit() {
    await createOnlineVisit(true);
  }
  useEffect(() => {
    if (potentialInsurance?.includes('OON')) {
      createVisit();
    }
  }, [potentialInsurance]);

  return (
    <Container maxWidth="lg">
      <Grid container direction="column" gap="48px">
        {specificCare === SpecificCareOption.VIRTUAL_URGENT_CARE ? (
          <>
            <Typography variant="h2">You’re in the right place!</Typography>
            <Typography variant="body1">
              You’re about to get in line to have a video chat with an expert
              Zealthy provider.
            </Typography>
          </>
        ) : (
          <Typography variant="h2">
            {potentialInsurance === PotentialInsuranceOption.OUT_OF_NETWORK_V2
              ? 'Confirm your visit with a doctor. Get diagnosis and Rx with or without insurance.'
              : 'Please request your remote visit.'}
          </Typography>
        )}

        <CareTeam show={open} />
      </Grid>
    </Container>
  );
};

export default ScheduleVisit;
