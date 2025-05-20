import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircleIcon from '@mui/icons-material/Circle';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import { Dispatch, Fragment, SetStateAction, useEffect } from 'react';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import WhiteBox from '@/components/shared/layout/WhiteBox';
import { Database } from '@/lib/database.types';
import { Order } from '@/components/screens/Checkout/types';
import { useCoachingActions } from '@/components/hooks/useCoaching';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import { useIntakeActions } from '@/components/hooks/useIntake';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';

type SubscriptionOption =
  Database['public']['Tables']['subscription']['Row'] & {
    selected: boolean;
    index: number;
    isMostPopular: boolean;
    isBestValue: boolean;
    recurring: {
      interval: 'month';
      interval_count: number;
    };
    discountedPrice: number;
  };
interface MultiItemProps {
  subscription: SubscriptionOption;
  handleSelect: (event: React.MouseEvent<HTMLDivElement>) => void;
  updateOrder?: Dispatch<SetStateAction<Order>>;
}

const MultiItem = ({ subscription, handleSelect }: MultiItemProps) => {
  const { addCoaching, removeCoaching } = useCoachingActions();
  const { addPotentialInsurance } = useIntakeActions();

  useEffect(() => {
    if (subscription.selected) {
      removeCoaching(CoachingType.WEIGHT_LOSS);
      addCoaching({
        type: CoachingType.WEIGHT_LOSS,
        name: subscription.name,
        id: subscription.id,
        planId: subscription.reference_id,
        recurring: subscription.recurring,
        price: subscription.price,
        discounted_price: subscription.discountedPrice,
      });

      addPotentialInsurance(subscription.name as PotentialInsuranceOption);
    }
  }, [subscription.selected]);
  const isMobile = useIsMobile();

  const originalPrice = 135 * subscription.recurring.interval_count;

  const monthlyPrice = Number(
    (subscription.price / subscription.recurring.interval_count).toFixed(2)
  );

  const thereAfterMap: { [key: number]: string } = {
    1: '$135/month thereafter',
    3: '$113/month thereafter (paid quarterly)',
    6: '$99.83/month thereafter (paid 2x/year)',
    12: '$85/month thereafter (paid annually)',
  };

  const saveAmount =
    originalPrice - monthlyPrice * subscription.recurring.interval_count + 86;

  return (
    <Fragment key={1}>
      <WhiteBox
        padding={isMobile ? '14px 14px' : '16px 24px'}
        gap="2px"
        sx={{ cursor: 'pointer' }}
        onClick={handleSelect}
      >
        {subscription.isMostPopular || subscription?.isBestValue ? (
          <Box sx={{ display: 'flex' }}>
            <Typography
              bgcolor="#00531B"
              borderRadius="12px"
              padding={'4px 24px'}
              color="white"
              fontWeight={600}
            >
              {subscription?.isMostPopular ? 'Most popular' : 'Best value'}
            </Typography>
          </Box>
        ) : null}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            marginTop: '20px',
            marginBottom: '10px',
            marginRight: '20px',
          }}
        >
          {' '}
          <Typography sx={{ display: 'flex', alignItems: 'center' }}>
            {subscription.selected ? (
              <CircleIcon
                sx={{
                  color: 'black',
                }}
              />
            ) : (
              <CircleOutlinedIcon />
            )}

            <Typography
              component={'span'}
              sx={{
                textAlign: 'center',
                fontWeight: 'bold',
                marginLeft: '10px',
                fontSize: isMobile ? '16px !important' : '20px !important',
              }}
            >
              {subscription.recurring.interval_count === 1
                ? 'Monthly'
                : `Every ${subscription.recurring.interval_count} months`}
            </Typography>
          </Typography>
          <Typography
            sx={{
              fontSize: isMobile ? '12x !important' : '20px !important',
              color: '#00531B',
              fontWeight: 'bold',
            }}
          >
            <Typography
              component="span"
              sx={{
                textDecoration: 'line-through',
                fontSize: isMobile ? '12px !important' : '20px !important',
                color: '#777',
              }}
            >
              {originalPrice !== monthlyPrice ? '$135/month' : null}
            </Typography>
            <Typography
              component="span"
              sx={{
                fontSize: isMobile ? '12px !important' : '20px !important',
                color: '#777',
              }}
            >
              {originalPrice !== monthlyPrice ? <> | </> : null}
            </Typography>
            {`$${Math.floor(monthlyPrice)}/month`}
          </Typography>
        </Box>

        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Stack
              gap="2px"
              sx={{
                marginLeft: isMobile ? '20px' : '35px',
                marginTop: '15px',
                marginRight: '20px',
                color: '#535353',
                lineHeight: '16px',
              }}
            >
              <Typography
                sx={{
                  fontSize: isMobile ? '12px !important' : '14px !important',
                }}
              >
                {`Pay $${subscription.discountedPrice} today for first month`}
              </Typography>
              <Typography
                sx={{
                  fontSize: isMobile ? '12px !important' : '14px !important',
                }}
              >
                {thereAfterMap[subscription.recurring.interval_count]}
              </Typography>
              <Typography
                sx={{
                  fontSize: isMobile ? '12px !important' : '14px !important',
                }}
              >
                Cancel any time
              </Typography>
            </Stack>
            <Box
              sx={{
                display: 'flex',
                paddingX: isMobile ? '12px' : '14px',
                paddingY: isMobile ? '8px' : '14px',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#8ACDA0',
                borderRadius: '12px',
              }}
            >
              <Typography
                sx={{
                  width: '100%',
                  fontSize: isMobile ? '18px !important' : '24px !important',
                  fontWeight: '600',
                  textAlign: 'center',
                  lineHeight: 'normal',
                }}
              >
                {' '}
                Save{' '}
                {
                  <Box
                    sx={{
                      paddingTop: isMobile ? '0px' : '10px',
                    }}
                  >
                    {`$${Math.floor(saveAmount)}`}{' '}
                  </Box>
                }
              </Typography>
            </Box>
          </Box>
        </>
      </WhiteBox>
    </Fragment>
  );
};

export { MultiItem };
