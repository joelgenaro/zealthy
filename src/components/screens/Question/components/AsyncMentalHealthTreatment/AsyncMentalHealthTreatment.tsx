import { Paper, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import Pill from 'public/images/pill.png';

const AsyncMentalHealthTreatment = () => {
  return (
    <Stack gap="16px">
      <Paper sx={{ borderRadius: '16px' }}>
        <Stack alignItems="center" gap="16px" padding="36px 24px">
          <Typography variant="h3" textAlign="center">
            Anxiety & Depression Medication
          </Typography>
          <Image
            width={Pill.width}
            height={Pill.height}
            src={Pill.src}
            alt={'Pill'}
          />
          <Typography textAlign="center">
            such as the generic form of Lexapro®, Zoloft®, Wellbutrin®, and
            Celexa®
          </Typography>
        </Stack>
      </Paper>
      <Typography>
        SSRIs and SNRIs have been shown to reduce symptoms of anxiety and
        depression, such as panic attacks, moodiness, and lethargy.
      </Typography>
      <Typography fontWeight="600">
        Most patients begin to see an improvement in their symptoms in 3 weeks,
        on average.
      </Typography>
    </Stack>
  );
};

export default AsyncMentalHealthTreatment;
