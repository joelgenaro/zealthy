import { useCoachingActions } from '@/components/hooks/useCoaching';
import CalendarOutline from '@/components/shared/icons/CalendarOutline';
import CareIcon from '@/components/shared/icons/CareIcon';
import ForumIcon from '@/components/shared/icons/ForumIcon';
import MedicineIcon from '@/components/shared/icons/MedicineIcon';
import TeamIcon from '@/components/shared/icons/TeamIcon';
import WhiteBox from '@/components/shared/layout/WhiteBox';
import {
  CoachingState,
  CoachingType,
} from '@/context/AppContext/reducers/types/coaching';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import MonitorWeightOutlinedIcon from '@mui/icons-material/MonitorWeightOutlined';
import { Order } from '../../types';
import { Price } from '../OrderSummary/components/Fee';
import RemovingModal from '@/components/shared/RemovingModal';
import { useIntakeState } from '@/components/hooks/useIntake';
import coachingNameFilter from '@/utils/coachingNameFilter';
import { CouponCodeRedeemProps, useLanguage } from '@/components/hooks/data';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import {
  AssignmentTurnedInOutlined,
  MedicalInformationOutlined,
} from '@mui/icons-material';

const mapCoachTypeToText: {
  [key in keyof typeof CoachingType]: {
    text: string;
    Icon: any;
  }[];
} = {
  WEIGHT_LOSS: [
    {
      text: 'Provider reviews your medical history and writes prescription for GLP-1, if appropriate',
      Icon: AssignmentTurnedInOutlined,
    },
    {
      text: 'Zealthy will work with your insurance so that they will pay for your weight loss medication (if prescribed), including GLP-1s',
      Icon: MedicalInformationOutlined,
    },
    {
      text: 'Access to affordable compound GLP-1 medications without insurance required, as little as $151/month (compare to $1,000+ elsewhere); not included in membership',
      Icon: MedicineIcon,
    },
    {
      text: 'You will be matched to a coach to build an individualized weight loss program to supplement your medication',
      Icon: CareIcon,
    },
    {
      text: 'Unlimited messaging with coach and progress tracking',
      Icon: ForumIcon,
    },
  ],
  MENTAL_HEALTH: [
    {
      text: 'Initial video or phone visit, including diagnosis if appropriate, with Zealthy mental health provider',
      Icon: CareIcon,
    },
    {
      text: 'Rx sent to your home or preferred pharmacy, if prescribed',
      Icon: MedicineIcon,
    },
    {
      text: 'Follow-up video or phone visits with your Zealthy mental health provider',
      Icon: CalendarOutline,
    },
    {
      text: 'Unlimited messaging with coordinator and mental health provider',
      Icon: ForumIcon,
    },
  ],
  PERSONALIZED_PSYCHIATRY: [
    {
      text: 'Initial video or phone visit, including diagnosis if appropriate, with Zealthy mental health provider',
      Icon: TeamIcon,
    },
    {
      text: 'Rx sent to your home and included in your membership or sent to your preferred pharmacy if preferred',
      Icon: MedicineIcon,
    },
    {
      text: 'Follow-up video or phone visits with your Zealthy mental health provider',
      Icon: CalendarOutline,
    },
    {
      text: 'Unlimited messaging with coordinator and mental health provider',
      Icon: ForumIcon,
    },
  ],
};
const weightLossAccess = [
  {
    text: 'Access to scheduling visits with Zealthy providers who can work with you to consider a science-backed weight loss plan',
    Icon: MedicineIcon,
  },
  {
    text: 'Zealthy can work with you to help you get GLP-1 medication affordably, if prescribed',
    Icon: CalendarOutline,
  },
  {
    text: 'You will be matched to a coach to build an individualized weight loss program to supplement your medication',
    Icon: CareIcon,
  },
  {
    text: 'Unlimited messaging with coach and progress tracking',
    Icon: ForumIcon,
  },
];

const semaglutideBundled = [
  {
    text: 'Provider reviews your medical history and writes prescription for Semaglutide if medically appropriate',
    Icon: MedicineIcon,
  },
  {
    text: 'Your medication will be shipped to your home',
    Icon: CalendarOutline,
  },
  {
    text: 'Unlimited messaging and progress tracking',
    Icon: ForumIcon,
  },
  {
    text: 'Lose weight with a science-backed approach. You will be eligible for a full refund if you have not received medication within 30 days',
    Icon: MonitorWeightOutlinedIcon,
  },
];
const WeightLossSync = [
  {
    text: 'Complete your video visit with Zealthy Provider, who will write prescription for GLP-1 if clinically appropriate',
    Icon: MedicineIcon,
  },
  {
    text: 'Zealthy will work with your insurance so that they will pay for your weight loss medication (if prescribed), including GLP-1s',
    Icon: CalendarOutline,
  },
  {
    text: 'You will be matched to a coach to build an individualized weight loss program to supplement your medication',
    Icon: CareIcon,
  },
  {
    text: 'Unlimited messaging with coach and progress tracking; optional video or phone sessions with coach every other week',
    Icon: ForumIcon,
  },
];
const tirzepatideBundled = [
  {
    text: 'Provider reviews your medical history and writes prescription for Tirzepatide if medically appropriate',
    Icon: MedicineIcon,
  },
  {
    text: 'Your medication will be shipped to your home',
    Icon: CalendarOutline,
  },
  {
    text: 'Unlimited messaging and progress tracking',
    Icon: ForumIcon,
  },
  {
    text: 'Lose weight with a science-backed approach. You will be eligible for a full refund if you have not received medication within 30 days',
    Icon: MonitorWeightOutlinedIcon,
  },
];

interface CoachingCardProps {
  coach: CoachingState;
  updateOrder: Dispatch<SetStateAction<Order>>;
  canRemove: boolean;
  referral: any;
  couponCodeRedeem?: CouponCodeRedeemProps;
  specificCare?: SpecificCareOption;
  isMulti: boolean;
}

const MultiCoachingCard = ({
  coach,
  updateOrder,
  canRemove,
  referral,
  couponCodeRedeem,
  specificCare,
  isMulti = false,
}: CoachingCardProps) => {
  const { removeCoaching } = useCoachingActions();
  const { potentialInsurance, variant } = useIntakeState();
  const [openModal, setOpenModal] = useState(false);
  const language = useLanguage();

  const listItems = useMemo(() => {
    let listItems = mapCoachTypeToText[coach.type];

    if (coach.name === 'Z-Plan by Zealthy Weight Loss Access Program') {
      listItems = weightLossAccess;
    }

    if (potentialInsurance === 'Weight Loss Sync') {
      listItems = WeightLossSync;
    }

    if (potentialInsurance === 'Semaglutide Bundled') {
      listItems = semaglutideBundled;
    }

    if (potentialInsurance === 'Tirzepatide Bundled') {
      listItems = tirzepatideBundled;
    }

    if (variant === '3055') {
      return listItems
        .filter(
          item =>
            item.text !==
            'You will be matched to a coach to build an individualized weight loss program to supplement your medication'
        )
        .map(item => ({
          ...item,
          text: item.text.replace(
            'Unlimited messaging with coach and progress tracking',
            'Unlimited messaging and progress tracking'
          ),
        }));
    }

    return listItems;
  }, [coach.name, coach.type, potentialInsurance, variant]);

  const handleRemove = useCallback(() => {
    updateOrder(order => ({
      ...order,
      coaching: order.coaching.filter(c => c.planId !== coach.planId),
    }));
    removeCoaching(coach.type);
  }, [coach.planId, coach.type, removeCoaching, updateOrder]);

  useEffect(() => {
    updateOrder(order => ({
      ...order,
      coaching: [
        {
          name: coach.name,
          id: coach.id,
          planId: coach.planId,
          price:
            (coach.discounted_price || coach.price) -
            (specificCare === SpecificCareOption.WEIGHT_LOSS
              ? couponCodeRedeem?.coupon_code?.value ?? 0
              : 0),
          require_payment_now: true,
          type: coach.type,
        },
      ],
    }));
  }, [
    coach.discounted_price,
    coach.id,
    coach.name,
    coach.planId,
    coach.price,
    coach.recurring,
    couponCodeRedeem,
    coach.type,
    updateOrder,
    specificCare,
  ]);

  let afterFirtMonth = '$135/month after first month';

  if (language === 'esp') {
    afterFirtMonth = '$135/al mes despues del primer mes';
  }

  return (
    <WhiteBox padding="16px 24px" gap="2px">
      <Stack direction="row" justifyContent="space-between">
        <Stack>
          <Stack gap="3px">
            <Typography fontWeight={600}>
              {coachingNameFilter(coach.name)}
            </Typography>
            {potentialInsurance ===
            PotentialInsuranceOption.FIRST_MONTH_FREE ? (
              <>
                <Typography variant="h4">
                  Limited time offer: First month free
                </Typography>
                <Typography variant="h4">{afterFirtMonth}</Typography>
              </>
            ) : (
              <>
                {referral?.patient_referral.specific_care === 'Weight loss' && (
                  <Typography variant="h4">
                    {'$10 referral discount applied for second month'}
                  </Typography>
                )}
                {!couponCodeRedeem?.redeemed &&
                ['katie', 'wgar'].includes(couponCodeRedeem?.code || '') ? (
                  <Typography variant="h4">{'$10 radio discount'}</Typography>
                ) : null}
              </>
            )}
            <Typography variant="h4">Cancel anytime</Typography>
          </Stack>
        </Stack>
        <Stack>
          {potentialInsurance === 'OH' ? null : (
            <Price
              discountPrice={
                coach.discounted_price
                  ? `${
                      coach.discounted_price -
                      (couponCodeRedeem?.coupon_code?.value ?? 0)
                    }`
                  : undefined
              }
              price={`${135 * coach.recurring.interval_count} ${
                coach.discounted_price ? '' : '/ month'
              }`}
            />
          )}
        </Stack>
      </Stack>
      <Box>
        <Divider style={{ width: 'auto', margin: '16px -24px' }} />
        <Stack direction="column" gap="16px">
          {listItems.map(({ text, Icon }) => (
            <Stack key={text} direction="row" gap="16px">
              <Typography>
                <Icon />
              </Typography>
              <Typography variant="h4">{text}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
      {canRemove &&
      coach.name !== 'Z-Plan by Zealthy Weight Loss Access Program' &&
      potentialInsurance !== 'Weight Loss Sync' ? (
        <Box>
          <Divider
            sx={{
              margin: '16px -24px 10px -24px',
            }}
          />
          <Stack
            alignItems="end"
            bgcolor="inherit"
            sx={{
              borderBottomRightRadius: '0.75rem',
              borderBottomLeftRadius: '0.75rem',
            }}
          >
            <Button
              onClick={() => setOpenModal(true)}
              variant="text"
              sx={{
                padding: '0',
                textDecoration: 'underline',
                '&.MuiButton-root': {
                  height: 'inherit',
                },
              }}
            >
              <Typography>Remove</Typography>
            </Button>
          </Stack>
        </Box>
      ) : null}
      {openModal ? (
        <RemovingModal
          onClose={() => setOpenModal(false)}
          onRemove={handleRemove}
        />
      ) : null}
    </WhiteBox>
  );
};

export default MultiCoachingCard;
