import Title from '@/components/shared/Title';
import VisitSummary from '@/components/shared/VisitSummary';
import { Button, Container, Stack } from '@mui/material';
import Box from '@mui/material/Box';

type Provider = {
  first_name: string | null | undefined;
  last_name: string | null | undefined;
  specialties: string | null | undefined;
  avatar_url: string | null | undefined;
};
interface VisitProps {
  appointment: {
    starts_at: string | null | undefined;
    ends_at: string | null | undefined;
    appointment_type: string | null | undefined;
    provider: Provider | null | undefined;
    daily_room?: string | null | undefined;
    id?: number;
  };
  goBack: () => void;
  goNext: () => void;
}

const VisitConfirmation = ({ appointment, goBack, goNext }: VisitProps) => {
  return (
    <Container maxWidth="md">
      <Stack gap="3rem">
        <Title text="Your visit is now scheduled." />
        <VisitSummary isConfirmed appointment={appointment} />

        <Box display="flex" flexDirection="column" gap="16px">
          <Button onClick={goNext}>Continue</Button>
          <Button onClick={goBack} color="grey">
            Reschedule
          </Button>
        </Box>
      </Stack>
    </Container>
  );
};

export default VisitConfirmation;
