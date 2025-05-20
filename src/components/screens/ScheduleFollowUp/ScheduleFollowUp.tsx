import { Container, Grid } from '@mui/material';
import CareTeam from './components/CareTeam';

interface Props {
  appointmentInfo: {
    id: number;
    starts_at: string | null;
    duration: number;
    status: string;
  };
  onBack: () => void;
}

const ScheduleFollowUp = ({ appointmentInfo, onBack }: Props) => {
  return (
    <Container maxWidth="lg">
      <Grid container direction="column" gap="48px">
        <CareTeam onBack={onBack} appointmentInfo={appointmentInfo} />
      </Grid>
    </Container>
  );
};

export default ScheduleFollowUp;
