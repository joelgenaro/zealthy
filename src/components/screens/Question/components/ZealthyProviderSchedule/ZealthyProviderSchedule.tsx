import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CareTeam from './components/CareTeam';

interface ZealthyProviderScheduleProps {
  onSelect: (nextPage: string | undefined) => void;
}

const ZealthyProviderSchedule = ({
  onSelect,
}: ZealthyProviderScheduleProps) => {
  return (
    <Container maxWidth="lg">
      <Grid container direction="column" gap="48px">
        <Typography variant="h2">Please schedule your remote visit.</Typography>
        <CareTeam onSelect={onSelect} />
      </Grid>
    </Container>
  );
};

export default ZealthyProviderSchedule;
