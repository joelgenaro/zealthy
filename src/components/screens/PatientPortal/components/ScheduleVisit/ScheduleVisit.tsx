import { useEffect } from 'react';
import { Container, Grid, Typography } from '@mui/material';
import CareTeam from './components/CareTeam';
import { useIntakeSelect } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';

const ScheduleVisit = () => {
  const specificCare = useIntakeSelect(intake => intake.specificCare);

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
  }, []);

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
          <>
            <Typography variant="h2">
              Please request your remote visit.
            </Typography>
          </>
        )}

        <CareTeam show={true} />
      </Grid>
    </Container>
  );
};

export default ScheduleVisit;
