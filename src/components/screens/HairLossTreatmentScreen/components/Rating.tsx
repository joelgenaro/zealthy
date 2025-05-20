import { useIsMobile } from '@/components/hooks/useIsMobile';
import StarFill from '@/components/shared/icons/StarFill';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import BeforeAfter from 'public/images/before-after.png';

const Rating = () => {
  const isMobile = useIsMobile();
  return (
    <Stack direction={isMobile ? 'column' : 'row'} alignItems="center">
      <Stack width="100%" gap="16px">
        <Stack direction="row">
          <StarFill />
          <StarFill />
          <StarFill />
          <StarFill />
          <StarFill />
        </Stack>
        <Typography width="315px" variant="h4">
          {`I couldn't believe the results I started seeing between 4-5 months.
          Even my barber commented on it. I'm feeling more confident
          with my thicker hair and can't wait to see what the long-term results
          are going to be. All around low risk, high reward for the results that I've been seeing. 
          REALLY thrilled I found Zealthy when I did.`}
        </Typography>
        <Stack direction="row" gap="8px">
          <Typography fontWeight={600}>Matthew,</Typography>
          <Typography>Naples, FL</Typography>
        </Stack>
      </Stack>
      <Image
        src={BeforeAfter}
        alt="man with hair"
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </Stack>
  );
};

export default Rating;
