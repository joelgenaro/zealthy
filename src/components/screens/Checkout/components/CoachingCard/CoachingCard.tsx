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
import { monthsFromNow } from '@/utils/monthsFromNow';
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
import { useVWOVariationName } from '@/components/hooks/data';
import getConfig from '../../../../../../config';

const siteName = getConfig(
  process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
).name;

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
      text: `${siteName} will work with your insurance so that they will pay for your weight loss medication (if prescribed), including GLP-1s`,
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
      text: `Initial video or phone visit, including diagnosis if appropriate, with ${siteName} mental health provider`,
      Icon: CareIcon,
    },
    {
      text: 'Rx sent to your home or preferred pharmacy, if prescribed',
      Icon: MedicineIcon,
    },
    {
      text: `Follow-up video or phone visits with your ${siteName} mental health provider`,
      Icon: CalendarOutline,
    },
    {
      text: 'Unlimited messaging with coordinator and mental health provider',
      Icon: ForumIcon,
    },
  ],
  PERSONALIZED_PSYCHIATRY: [
    {
      text: `Initial video or phone visit, including diagnosis if appropriate, with ${siteName} mental health provider`,
      Icon: TeamIcon,
    },
    {
      text: 'Rx sent to your home and included in your membership or sent to your preferred pharmacy if preferred',
      Icon: MedicineIcon,
    },
    {
      text: `Follow-up video or phone visits with your ${siteName} mental health provider`,
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
    text: `Access to scheduling visits with ${siteName} providers who can work with you to consider a science-backed weight loss plan`,
    Icon: MedicineIcon,
  },
  {
    text: `${siteName} can work with you to help you get GLP-1 medication affordably, if prescribed`,
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
const weightLossSpanish = [
  {
    text: 'El proveedor revisa su historial médico y escribe una receta para GLP-1, si es apropiado',
    Icon: AssignmentTurnedInOutlined,
  },
  {
    text: `${siteName} trabajará con su seguro para que paguen por su medicamento para perder peso (si se receta), incluyendo GLP-1s`,
    Icon: MedicalInformationOutlined,
  },
  {
    text: 'Acceso a medicamentos GLP-1 compuestos asequibles sin necesidad de seguro, desde tan solo $151/mes (en comparación con más de $1,000 en otros lugares); no incluido en la membresía',
    Icon: MedicineIcon,
  },
  {
    text: 'Se le asignará un coach para crear un programa de pérdida de peso individualizado para complementar su medicación',
    Icon: CareIcon,
  },
  {
    text: 'Mensajería ilimitada con el coach y seguimiento del progreso',
    Icon: ForumIcon,
  },
];
const WeightLossSync = [
  {
    text: `Complete your video visit with ${siteName} Provider, who will write prescription for GLP-1 if clinically appropriate`,
    Icon: MedicineIcon,
  },
  {
    text: `${siteName} will work with your insurance so that they will pay for your weight loss medication (if prescribed), including GLP-1s (insurance does not always approve GLP-1’s)`,
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
const WeightLossSyncVar5751 = [
  {
    text: 'Provider reviews your medical history and writes prescription for GLP-1, if appropriate',
    Icon: AssignmentTurnedInOutlined,
  },
  {
    text: `${siteName} will work with your insurance so that they will pay for your weight loss medication (if prescribed), including GLP-1s (insurance does not always approve GLP-1’s)`,
    Icon: CalendarOutline,
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
  isPromoApplied?: boolean;
}

const CoachingCard = ({
  coach,
  updateOrder,
  canRemove,
  referral,
  couponCodeRedeem,
  specificCare,
  isPromoApplied,
}: CoachingCardProps) => {
  const { removeCoaching } = useCoachingActions();
  const { potentialInsurance, variant } = useIntakeState();
  const [openModal, setOpenModal] = useState(false);
  const { data: variant5751 } = useVWOVariationName('5751');
  const { data: variant5284 } = useVWOVariationName('5284');
  const { data: variation7861 } = useVWOVariationName('7861_1');

  const variant6471 =
    variant === '6471' &&
    specificCare === SpecificCareOption.WEIGHT_LOSS &&
    potentialInsurance === null;
  const language = useLanguage();
  const listItems = useMemo(() => {
    let listItems = mapCoachTypeToText[coach.type];

    if (coach.name === 'Z-Plan by Zealthy Weight Loss Access Program') {
      listItems = weightLossAccess;
    }

    if (language === 'esp') {
      listItems = weightLossSpanish;
    }

    if (
      specificCare === SpecificCareOption.WEIGHT_LOSS &&
      variant5751?.variation_name === 'Variation-1'
    ) {
      listItems = WeightLossSyncVar5751;
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
  }, [
    coach.name,
    coach.id,
    coach.planId,
    coach.discounted_price,
    coach.price,
    coach.type,
    couponCodeRedeem?.coupon_code?.value,
    specificCare,
    updateOrder,
    variant6471,
  ]);

  const handleRemove = useCallback(() => {
    updateOrder(order => ({
      ...order,
      coaching: order.coaching.filter(c => c.planId !== coach.planId),
    }));
    removeCoaching(coach.type);
  }, [coach.planId, coach.type, removeCoaching, updateOrder]);

  useEffect(() => {
    updateOrder(prevOrder => ({
      ...prevOrder,
      coaching: [
        ...prevOrder.coaching.filter(c => c.planId !== coach.planId),
        {
          name: coach.name,
          id: coach.id,
          planId: coach.planId,
          price:
            (coach.discounted_price || coach.price) -
            (specificCare === SpecificCareOption.WEIGHT_LOSS
              ? couponCodeRedeem?.coupon_code?.value ?? 0
              : 0),
          require_payment_now: variant6471 ? false : true,
          type: coach.type,
        },
      ],
    }));
  }, [
    coach,
    couponCodeRedeem?.coupon_code?.value,
    specificCare,
    updateOrder,
    variant6471,
  ]);

  let afterFirtMonth = '$135/month after first month';

  if (language === 'esp') {
    afterFirtMonth = ' $135/al mes despues del primer mes';
  }

  return (
    <WhiteBox padding="16px 24px" gap="2px">
      <Stack direction="row" justifyContent="space-between">
        {variant5284?.variation_name !== 'Variation-1' ? (
          <>
            <Stack>
              <Stack gap="3px">
                {variant6471 ? null : (
                  <Typography fontWeight={600}>
                    {language === 'esp'
                      ? `Programa de baja de peso de ${siteName}`
                      : coachingNameFilter(coach.name)}
                  </Typography>
                )}
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
                    {referral?.patient_referral.specific_care ===
                      'Weight loss' && (
                      <Typography variant="h4">
                        {afterFirtMonth}
                        {/* {'$10 referral discount applied for second month'} */}
                      </Typography>
                    )}
                    {!couponCodeRedeem?.redeemed &&
                    ['katie', 'wgar'].includes(couponCodeRedeem?.code || '') ? (
                      <Typography variant="h4">
                        {afterFirtMonth}
                        {/* {'$10 radio discount'} */}
                      </Typography>
                    ) : null}
                    {coach.type === CoachingType.PERSONALIZED_PSYCHIATRY ? (
                      <Typography variant="h4">{`$${
                        coach.price
                      }/month beginning ${monthsFromNow()}`}</Typography>
                    ) : coach.recurring.interval_count > 1 ? (
                      <>
                        <Typography variant="h4">
                          {`$${coach.price} every ${coach.recurring.interval_count} months thereafter`}
                        </Typography>
                      </>
                    ) : potentialInsurance === 'OH' ||
                      potentialInsurance === 'Semaglutide Bundled' ||
                      potentialInsurance === 'Tirzepatide Bundled' ||
                      variant6471 ? null : (
                      <>
                        {language === 'esp' ? (
                          <Typography variant="h4">
                            {`$${coach.price}/al mes ${
                              coach.discounted_price
                                ? `despues de ${
                                    referral?.patient_referral.specific_care ===
                                    'Weight loss'
                                      ? '2 meses'
                                      : 'el primer mes'
                                  } `
                                : ''
                            }`}
                          </Typography>
                        ) : (
                          <Typography variant="h4">
                            {`$${coach.price}/month ${
                              coach.discounted_price
                                ? `after first ${
                                    referral?.patient_referral.specific_care ===
                                    'Weight loss'
                                      ? '2 months'
                                      : 'month'
                                  } `
                                : ''
                            }`}
                          </Typography>
                        )}
                      </>
                    )}
                  </>
                )}
                {variant6471 ? null : (
                  <Typography variant="h4">
                    {language === 'esp'
                      ? 'Cancela cuando quieras'
                      : 'Cancel anytime'}
                  </Typography>
                )}
              </Stack>
            </Stack>

            <Stack>
              {
                potentialInsurance === 'OH' || variant6471 ? null : (
                  //
                  <Price
                    discountPrice={
                      coach.discounted_price
                        ? `${
                            coach.discounted_price -
                            (couponCodeRedeem?.coupon_code?.value ?? 0)
                          }`
                        : undefined
                    }
                    price={`${coach.price} ${
                      coach.discounted_price ? '' : '/ month'
                    }`}
                  />
                )
                //
              }
            </Stack>
          </>
        ) : null}
      </Stack>
      <Box>
        {variant6471 ? null : (
          <Divider style={{ width: 'auto', margin: '16px -24px' }} />
        )}
        <Stack direction="column" gap="16px">
          {listItems.map(({ text, Icon }) => (
            <Stack key={text} direction="row" gap="16px">
              <Typography>
                <Icon />
              </Typography>
              <Typography variant="h4">
                {['Variation-1', 'Variation-2'].includes(
                  variation7861?.variation_name!
                ) || variant === 'twelve-month'
                  ? text.replace('$151', '$70')
                  : text}
              </Typography>
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

export default CoachingCard;
