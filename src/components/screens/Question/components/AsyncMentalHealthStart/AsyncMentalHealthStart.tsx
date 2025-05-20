import { useIsMobile } from '@/components/hooks/useIsMobile';
import DosageAdjustment from '@/components/shared/icons/DosageAdjusment';
import ProviderReview from '@/components/shared/icons/ProviderReview';
import TreatmentPlan from '@/components/shared/icons/TreatmentPlan';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/system/Container';
import Box from '@mui/system/Box';

const items = [
  {
    id: '1',
    Icon: ProviderReview,

    header: 'Medical intake',
    description:
      'Tell us a little bit about your mental health and how you’re doing.',
  },
  {
    id: '2',
    Icon: TreatmentPlan,
    header: 'Provider review',
    description:
      'Your provider will review your answers online and, if appropriate, prescribe medication. No appointment necessary.',
  },
  {
    id: '3',
    Icon: DosageAdjustment,
    header: 'Receive treatment',
    description:
      'We’ll send your medication directly to your door, if prescribed.',
  },
];

interface AsyncMentalHealthFeelBetterProps {
  onClick: () => void;
}

const AsyncMentalHealthFeelBetter = ({
  onClick,
}: AsyncMentalHealthFeelBetterProps) => {
  const isMobile = useIsMobile();
  return (
    <Container
      sx={{
        maxWidth: isMobile ? '1200px' : '5000px',
        minWidth: isMobile ? '0px' : '1000px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          marginBottom: isMobile ? '15px' : '50px',
        }}
      >
        {' '}
        <Typography variant="h2" sx={{ textAlign: 'center', fontSize: '14px' }}>
          We’re here to help you feel better. Here is a bit about our process
          and what you’ll get through Zealthy:
        </Typography>
      </Box>

      <Stack
        direction={isMobile ? 'column' : 'row'}
        gap={isMobile ? '26px' : '100px'}
        alignItems="center"
        justifyContent=""
        sx={{
          minWidth: isMobile ? '0px' : '1000px',
        }}
      >
        {items.map(({ header, id, description, Icon }) => (
          <Paper
            key={id}
            sx={{
              borderRadius: '16px',
              padding: isMobile ? '26px 24px' : '60px 60px',
              maxWidth: isMobile ? '400px' : '2000px',
              minWidth: isMobile ? '0px' : '300px',
              height: isMobile ? '291px' : '400px',
              width: '1000px',
              flexBasis: '33%',
            }}
          >
            <Stack
              gap="16px"
              alignItems="center"
              justifyContent="center"
              width={isMobile ? '100%' : '200px'}
              height="100%"
            >
              <Icon />
              <Typography
                variant="h3"
                textAlign="center"
              >{`${id}. ${header}`}</Typography>
              <Typography textAlign="center">{description}</Typography>
            </Stack>
          </Paper>
        ))}
      </Stack>
      <Box
        sx={{
          marginTop: isMobile ? '10px' : '50px',
          marginBottom: isMobile ? '0px' : '10px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {' '}
        <Button
          sx={{ minWidth: isMobile ? '200px' : '500px' }}
          onClick={onClick}
        >
          Continue
        </Button>
      </Box>
    </Container>
  );
};

export default AsyncMentalHealthFeelBetter;
