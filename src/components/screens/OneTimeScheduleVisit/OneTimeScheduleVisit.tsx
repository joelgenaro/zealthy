import { Container, Grid, Typography } from '@mui/material';
import CareTeam from './components/CareTeam';
import SpecificCareTeam from './components/SpecificCareTeam';

interface Props {
  clinician_id?: number;
  duration: number;
}

const OneTimeScheduleVisit = ({ clinician_id, duration }: Props) => {
  return (
    <Container maxWidth="lg">
      <Grid container direction="column" gap="48px">
        <Typography variant="h2">
          {`Schedule your ${duration}-minute visit.`}
        </Typography>
        {clinician_id ? (
          <SpecificCareTeam clinician={clinician_id} duration={duration} />
        ) : (
          <CareTeam duration={duration} />
        )}
      </Grid>
    </Container>
  );
};

export default OneTimeScheduleVisit;
