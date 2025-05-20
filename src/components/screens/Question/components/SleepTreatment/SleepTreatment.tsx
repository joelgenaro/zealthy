import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
} from '@mui/material';

interface SleepTreatmentProps {
  nextPage: (nextPage?: string) => void;
}

const SleepTreatment = ({ nextPage }: SleepTreatmentProps) => {
  return (
    <Container maxWidth="md">
      <Stack spacing={4} alignItems="center">
        <Typography variant="h2">Your Recommended Sleep Treatment</Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Non-addictive and safe for long-term use
        </Typography>
        <Box
          component="img"
          src="/images/sleep/ramelteon.png"
          alt="Sleep medication"
          sx={{ width: 300, height: 300 }}
        />
        <Card
          sx={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '5px',
            width: '65%',
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={3}>
              <Typography variant="body1" color="#0F612A" align="left">
                Ramelteon (generic Rozerem®) is an FDA-approved prescription
                medication for helping you fall asleep faster and stay asleep
                for up to 8 hours.
              </Typography>
              <Box
                component="img"
                src="/images/sleep/clip-board.png"
                alt="Sleep medication"
                sx={{ width: 50, height: 50 }}
              />
            </Stack>
            <Typography
              variant="body2"
              color="textSecondary"
              align="left"
              marginTop="5px"
            >
              Ready for a good night&apos;s rest?
            </Typography>
            <Box
              sx={{
                backgroundColor: '#e6f8e6',
                padding: '8px',
                borderRadius: '8px',
                marginTop: '8px',
                textAlign: 'left',
              }}
            >
              <Typography
                variant="body1"
                sx={{ fontWeight: 'bold', color: 'green' }}
              >
                Medication name: Rozerem® (Ramelteon)
              </Typography>
            </Box>
          </CardContent>
        </Card>
        <Button
          variant="contained"
          sx={{
            bgcolor: { bgcolor: '#1B5E20' },
            '&:hover': '#2E7D32',
            width: '65%',
          }}
          onClick={() => nextPage()}
        >
          Continue
        </Button>
      </Stack>
    </Container>
  );
};

export default SleepTreatment;
