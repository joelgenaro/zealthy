import { useIsMobile } from '@/components/hooks/useIsMobile';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Icon1 from './Icon1';
import Icon2 from './Icon2';
import Icon3 from './Icon3';

const HowDoesItWork = () => {
  const isMobile = useIsMobile();

  return (
    <Stack
      gap="40px"
      alignItems="center"
      sx={{
        p: {
          textAlign: 'center',
        },
      }}
    >
      <Typography variant="h2">How Zealthy works</Typography>
      <Stack gap="24px" direction={isMobile ? 'column' : 'row'}>
        <Stack
          gap="16px"
          alignItems="center"
          flexBasis={isMobile ? '100%' : '33%'}
        >
          <Icon1 />
          <Typography variant="h3">1. Choose you plan</Typography>
          <Typography>
            Answer a few questions from the comfort of your home and choose a
            treatment plan.
          </Typography>
        </Stack>
        <Stack
          gap="16px"
          alignItems="center"
          flexBasis={isMobile ? '100%' : '33%'}
        >
          <Icon2 />
          <Typography variant="h3">2. Provider review and delivery</Typography>
          <Typography>
            A licensed provider will provide a treatment recommendation,
            including medication if appropriate.
          </Typography>
        </Stack>
        <Stack
          gap="16px"
          alignItems="center"
          flexBasis={isMobile ? '100%' : '33%'}
        >
          <Icon3 />
          <Typography variant="h3">
            3. Get back to having healthier hair
          </Typography>
          <Typography>
            If prescribed, your prescription gets delivered to your door based
            on your preferred refill amount. Easily message with your provider
            about your progress.
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default HowDoesItWork;
