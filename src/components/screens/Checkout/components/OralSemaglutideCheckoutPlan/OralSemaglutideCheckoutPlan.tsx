import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useMediaQuery } from '@mui/material';
import { Order } from '../../types';
import OralSemaglutidePlanDetails from '@/components/shared/OralSemaglutidePlanDetails';
import { CoachingState } from '@/context/AppContext/reducers/types/coaching';
import { useVWO } from '@/context/VWOContext';
import { usePatientState } from '@/components/hooks/usePatient';

interface OralSemaglutideCheckoutPlanProps {
  updateOrder: Dispatch<SetStateAction<Order>>;
  coach: CoachingState | undefined;
}

const desktopUrl =
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
    ? 'https://api.getzealthy.com/storage/v1/object/public/videos/Oral%20Semaglutide%20Bundled%20Horizontal.mp4'
    : 'https://staging.api.getzealthy.com/storage/v1/object/public/videos/Oral%20Semaglutide%20Bundled%20Horizontal.mp4';
const desktopThumbnailUrl =
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
    ? 'https://api.getzealthy.com/storage/v1/object/public/images/announcements/Oral-Semaglutide-Bundled-Horizontal-Thumbnail.png'
    : 'https://staging.api.getzealthy.com/storage/v1/object/public/images/announcements/Oral-Semaglutide-Bundled-Horizontal-Thumbnail.png';

const mobileUrl =
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
    ? 'https://api.getzealthy.com/storage/v1/object/public/videos/Oral%20Semaglutide%20Bundled%20Vertical.mp4'
    : 'https://staging.api.getzealthy.com/storage/v1/object/public/videos/Oral%20Semaglutide%20Bundled%20Vertical.mp4';
const mobileThumbnailUrl =
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
    ? 'https://api.getzealthy.com/storage/v1/object/public/images/announcements/Oral-Semaglutide-Bundled-Vertical-Thumbnail.png'
    : 'https://staging.api.getzealthy.com/storage/v1/object/public/images/announcements/Oral-Semaglutide-Bundled-Vertical-Thumbnail.png';

const OralSemaglutideCheckoutPlan = ({
  updateOrder,
  coach,
}: OralSemaglutideCheckoutPlanProps) => {
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const vwoContext = useVWO();
  const patientState = usePatientState();
  const isMobile = useMediaQuery('(max-width:640px)');
  const variationName9057_1 = vwoContext?.getVariationName(
    '9057_1',
    String(patientState?.id)
  );

  useEffect(() => {
    if (!coach?.id) return;
    updateOrder(order => ({
      ...order,
      coaching: order.coaching
        .filter(c => c.planId !== coach.planId)
        .concat({
          name: coach.name,
          id: coach.id,
          planId: coach.planId,
          price: coach.discounted_price || coach.price,
          require_payment_now: true,
          type: coach.type,
        }),
    }));
  }, [
    coach?.discounted_price,
    coach?.id,
    coach?.name,
    coach?.planId,
    coach?.price,
    coach?.type,
    updateOrder,
  ]);

  return (
    <Stack gap="32px">
      {variationName9057_1 === 'Variation-1' && (
        <>
          <Typography variant="subtitle1">
            Want to learn more about the Oral Semaglutide + Doctor program at
            Zealthy from our Medical Director? Watch this video.
          </Typography>
          <Stack sx={{ marginY: '1rem' }}>
            <video
              width="100%"
              controls
              style={{ borderRadius: '10px' }}
              poster={isMobile ? mobileThumbnailUrl : desktopThumbnailUrl}
            >
              <source
                src={isMobile ? mobileUrl : desktopUrl}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </Stack>
        </>
      )}
      <Typography variant="h3" textTransform="uppercase">
        Your Plan
      </Typography>
      <OralSemaglutidePlanDetails />
      <Stack>
        <Stack
          padding="32px 0"
          direction="row"
          justifyContent="space-between"
          borderTop="1px solid #E5DDD1"
        >
          <Typography variant="h3">Licensed provider review</Typography>
          <Typography variant="h3">Included</Typography>
        </Stack>
        <Stack
          padding="32px 0"
          direction="row"
          justifyContent="space-between"
          borderTop="1px solid #E5DDD1"
        >
          <Typography variant="h3">Expedited shipping</Typography>
          <Typography variant="h3">Included</Typography>
        </Stack>
        <Stack
          padding="32px 0"
          direction="row"
          justifyContent="space-between"
          borderTop="1px solid #E5DDD1"
        >
          <Typography variant="h3">On-demand care with a provider</Typography>
          <Typography variant="h3">Included</Typography>
        </Stack>
        <Stack
          padding="32px 0"
          direction="row"
          justifyContent="space-between"
          borderTop="1px solid #E5DDD1"
        >
          <Typography variant="h3">Due Today </Typography>
          <Typography variant="h3">$149</Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default OralSemaglutideCheckoutPlan;
