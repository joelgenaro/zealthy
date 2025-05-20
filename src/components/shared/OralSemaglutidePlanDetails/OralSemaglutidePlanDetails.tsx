import Image from 'next/image';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCoachingActions } from '@/components/hooks/useCoaching';
import { useEffect } from 'react';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import StrikethroughText from '../StrikethroughText';
import { useTheme } from '@mui/material';
import { useAnswerAsync } from '@/components/hooks/useAnswer';
import { QuestionnaireName } from '@/types/questionnaire';
import { envMapping } from '@/questionnaires';

const OralSemaglutidePlanDetails = () => {
  const isMobile = useIsMobile();
  const theme = useTheme();
  const { addCoaching } = useCoachingActions();

  const { submitAnswer } = useAnswerAsync(
    envMapping[QuestionnaireName.WEIGHT_LOSS_BUNDLED]!
  );

  const price = 249;
  const discountedPrice = 149;

  useEffect(() => {
    submitAnswer();
    addCoaching({
      type: CoachingType.WEIGHT_LOSS,
      name: 'Zealthy Weight Loss + Oral Semaglutide Tablets',
      id: 4,
      planId:
        process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
          ? 'price_1PJN8pAO83GerSecsyVllQIT'
          : 'price_1PUCWWAO83GerSec3QxbLhca',
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
      price,
      discounted_price: discountedPrice,
    });
  }, [addCoaching]);

  return (
    <Stack
      direction={isMobile ? 'column' : 'row'}
      gap="16px"
      alignItems="center"
    >
      <Stack
        alignItems="center"
        bgcolor="#E9EEEB"
        width={isMobile ? '100%' : '169px'}
        height={180}
      >
        <Image
          src="https://api.getzealthy.com/storage/v1/object/public/images/programs/oral_semaglutide.svg"
          width={169}
          height={180}
          alt="bottle"
        />
      </Stack>
      <Stack gap="16px" width="100%">
        <Typography variant="h3">Oral Semaglutide</Typography>
        <Stack direction="row" justifyContent="space-between">
          <Typography>Billed and shipped for:</Typography>
          <Stack direction={'row'} gap="8px">
            <Typography color={theme.palette.primary.light} fontWeight={600}>
              {`$${discountedPrice}`}
            </Typography>
            <StrikethroughText
              fontWeight={500}
            >{`$${price}`}</StrikethroughText>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default OralSemaglutidePlanDetails;
