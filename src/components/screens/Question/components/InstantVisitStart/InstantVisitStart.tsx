import { useEstimatedTime } from '@/components/hooks/useTreatMeNow';
import { MedicalAvatarGroup } from '@/components/shared/AvatarGroup';
import BaseCard from '@/components/shared/BaseCard';
import { Pathnames } from '@/types/pathnames';
import { Button, Grid, Link, Typography } from '@mui/material';
import { useCallback } from 'react';

interface InstantLiveVisitProps {
  nextPage: (nextPage?: string) => void;
}

const InstantLiveVisit = ({ nextPage }: InstantLiveVisitProps) => {
  const { time } = useEstimatedTime();
  const handleContinue = useCallback(() => nextPage(), [nextPage]);

  return (
    <>
      <BaseCard>
        <Grid
          container
          padding="32px 60px"
          direction="column"
          gap="16px"
          alignItems="center"
        >
          <Typography
            fontWeight={700}
            variant="h6"
            textAlign="center"
            lineHeight="25px"
          >
            Expected Wait Time:
            <br />
            {`${time} min`}
          </Typography>
          <MedicalAvatarGroup height={56} width={56} />
          <Typography variant="caption">
            Zealthy appreciates your patience, and we can’t wait to meet with
            you.
          </Typography>
        </Grid>
      </BaseCard>
      <Typography fontWeight="600">
        By clicking the continue button, you can complete Zealthy’s required
        medical forms while keeping your place in line.
      </Typography>
      <Button onClick={handleContinue}>Continue</Button>
      <Typography textAlign="center">
        Wait time too long? Don’t worry; you can{' '}
        <Link href={Pathnames.POST_CHECKOUT_SCHEDULE_VISIT}>
          schedule a visit for later.
        </Link>
      </Typography>
    </>
  );
};

export default InstantLiveVisit;
