import { usePatientState } from '@/components/hooks/usePatient';
import { useProfileState } from '@/components/hooks/useProfile';
import WhiteBox from '@/components/shared/layout/WhiteBox';
import { Check } from '@mui/icons-material';
import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import PaymentForm from '../components/PaymentForm';
import TermsOfUse from '@/components/shared/TermsOfUse';
import { Order } from '../types';
import { useEffect, useState } from 'react';
import { useSelector } from '@/components/hooks/useSelector';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { useIntakeState } from '@/components/hooks/useIntake';
import {
  CompoundDetailProps,
  useActivePatientReferralRedeem,
  useCouponCodeRedeem,
} from '@/components/hooks/data';
import { useCanRemove } from '@/components/hooks/useCanRemove';
import { useTotalAmount } from '@/components/hooks/useTotalAmount';
import MedicationAndDosage from '@/components/shared/AddOnPayment/_utils/MedicationAndDosage';
import { useVisitActions, useVisitState } from '@/components/hooks/useVisit';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import BundledRadioButton from './components/BundledRadioButton';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import { useCoachingActions } from '@/components/hooks/useCoaching';
import ABTestContext from '@/context/ABTestContext';
import { useVWO } from '@/context/VWOContext';

const semaglutideInformation = [
  'Free provider evaluation, 100% online',
  'Lose weight with a science-backed approach. You will be eligible for a full refund if you have not received medication within 30 days',
  'Ongoing check-ins & free messaging',
  'Free shipping, fresh supply every 3 months',
];

const BundledCheckoutV2 = ({ videoUrl }: { videoUrl?: string }) => {
  const profileState = useProfileState();
  const patientState = usePatientState();
  const isMobile = useIsMobile();
  const vwoContext = useVWO();
  const { addMedication } = useVisitActions();
  const { addCoaching } = useCoachingActions();
  const coaching = useSelector(store => store.coaching);
  const { medications } = useVisitState();
  const { data: couponCodeRedeem } = useCouponCodeRedeem();
  const { data: patientReferralRedeem } = useActivePatientReferralRedeem();
  const { specificCare, potentialInsurance } = useIntakeState();
  const [order, setOrder] = useState<Order>({
    subscriptions: [],
    visit: null,
    medications: [],
    coaching: [],
    consultation: [],
  });
  const canRemove = useCanRemove(order);
  const totalAmount = useTotalAmount(order);
  const appointment = useSelector(store =>
    store.appointment.find(a => a.appointment_type === 'Provider')
  );
  const [selected, setSelected] = useState<string>('3 month supply');
  const [compoundDetails, setCompoundDetails] =
    useState<CompoundDetailProps | null>(null);
  const [singlePlan, setSinglePlan] = useState<string | null>(null);
  const [bulkPlan, setBulkPlan] = useState<string | null>(null);
  let variationName5481;

  if (
    ['CA', 'TX'].includes(patientState?.region!) &&
    [PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED]?.includes(
      potentialInsurance || PotentialInsuranceOption.DEFAULT
    )
  ) {
    variationName5481 = vwoContext?.getVariationName(
      '5481',
      String(patientState?.id)
    );
  }

  const medicationFrequencies = [
    {
      id: 4,
      planId:
        process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
          ? 'price_1PfqlXAO83GerSecpsmBc17r'
          : 'price_1PfqrmAO83GerSecF9WROtam',
      frequency: '3 month supply',
      subHeader: '$210/month first 3 months',
      subHeader2: '$297/month after',
      hasBanner: true,
      discounted_price: 630,
      dosage: '10 mg (3 vials included in shipment - 2.5 mg, 2.5 mg, 5 mg)',
      dose: '<p class="subtitle">Month 1 (Weeks 1-4)</p>\n    <p>Inject 10 units (0.25 mg) weekly</p><p class="subtitle">Month 2 (Weeks 5-8)</p>\n    <p>Inject 20 units (0.5 mg) weekly</p><p class="subtitle">Month 3 (Weeks 9-12)</p>\n    <p>Inject 50 units (1.25 mg) weekly</p>',
      medication_quantity_id: 98,
      name: 'Semaglutide',
      price: 891,
      quantity: 1,
      recurring: { interval: 'month', interval_count: 3 },
      type: CoachingType.WEIGHT_LOSS,
      note: `Weight loss - Semaglutide BUNDLED - 3 months. Dosage: ${medications[0].dosage}`,
    },
    {
      id: 4,
      planId:
        process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
          ? 'price_1NudYDAO83GerSecwJSW28y6'
          : 'price_1NudYfAO83GerSec0QE1mgIo',
      frequency: 'Shipped monthly',
      subHeader: '$217 first month',
      subHeader2: '$297/month after',
      hasBanner: false,
      dosage: '2.5 mg',
      dose: '<p class="subtitle">Month 1 (Weeks 1-4)</p>\n    <p>Inject 10 units (0.25 mg) weekly</p>',
      medication_quantity_id: 98,
      name: 'Semaglutide',
      price: 297,
      discounted_price: 217,
      quantity: 1,
      recurring: { interval: 'month', interval_count: 1 },
      type: CoachingType.WEIGHT_LOSS,
    },
  ];

  useEffect(() => {
    coaching.map(coach => {
      setOrder(order => ({
        ...order,
        coaching: order.coaching
          .filter(c => c.planId !== coach.planId)
          .concat({
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
          }),
      }));
    });
  }, [
    canRemove,
    coaching,
    couponCodeRedeem,
    patientReferralRedeem,
    specificCare,
  ]);

  const handleOnChange = (option: any) => {
    setSelected(option.frequency);
    addMedication(option);
    setOrder(order => ({
      ...order,
      coaching: order.coaching
        .filter(c => c.type !== option.type)
        .concat({
          name: coaching?.[0]?.name,
          id: option.id,
          planId: option.planId,
          price: option.discounted_price || option.price,
          require_payment_now: true,
          type: CoachingType.WEIGHT_LOSS,
        }),
    }));
    addCoaching({
      name: coaching?.[0]?.name,
      id: option.id,
      planId: option.planId,
      price: option.price,
      discounted_price: option.discounted_price,
      recurring: option.recurring,
      type: CoachingType.WEIGHT_LOSS,
    });
  };

  return (
    <ABTestContext value={variationName5481 || ''}>
      <Container maxWidth="md">
        <Grid
          container
          gap={{ sm: '25px', xs: '16px' }}
          maxWidth="590px"
          margin="0 auto"
          direction="column"
        >
          <Stack
            sx={{
              borderRadius: '12px',
              width: '100%',
              gap: '2rem',
            }}
          >
            <Typography variant="h2">
              Lasting weight loss, within reach!
            </Typography>
            <WhiteBox sx={{ gap: '1rem' }}>
              <Typography variant="h3">{`${profileState.first_name}'s treatment`}</Typography>
              <Box
                display="flex"
                justifyContent="space-between"
                sx={{
                  borderRadius: '12px',
                  backgroundColor: '#EAFFF1',
                  //   padding: '10px',
                }}
              >
                <Box sx={{ padding: '20px' }}>
                  <Typography fontWeight={500} variant="h3">
                    Compounded Semaglutide
                  </Typography>
                  <Typography width="200px">
                    + medication supplies, personalized program
                  </Typography>
                </Box>
                <Image
                  src="/images/half_semaglutide_bottle.png"
                  alt="semaglutide-bottle"
                  style={{
                    width: isMobile ? '16%' : '14%',
                    height: '20%',
                    position: 'relative',
                    right: 40,
                    top: isMobile ? 25 : 13,
                  }}
                />
              </Box>
              <MedicationAndDosage
                medication={medications[0]}
                isBundledCheckout={true}
                videoUrl={videoUrl}
              />
              <Typography fontWeight={500}>
                Includes compounded semaglutide and:
              </Typography>
              <Stack gap={1}>
                {semaglutideInformation.map(info => (
                  <Box
                    key={info}
                    display="flex"
                    alignItems="center"
                    sx={{ gap: '0.5rem' }}
                  >
                    <Check sx={{ color: '#00872B' }} />
                    <Typography>{info}</Typography>
                  </Box>
                ))}
              </Stack>
              <hr
                style={{
                  borderTop: '0.5px solid #D8D8D8',
                  width: '95%',
                  position: 'relative',
                  bottom: '6px',
                }}
              />
              <Typography variant="h3" fontWeight={400}>
                Select shipping frequency
              </Typography>
              <Typography>
                Go for a longer plan to stay consistent and get results that
                last.
              </Typography>
              {medicationFrequencies.map(med => (
                <BundledRadioButton
                  key={med.frequency}
                  option={med}
                  basePrice={med.price}
                  isSelected={med.frequency === selected}
                  onChange={handleOnChange}
                />
              ))}
              <hr
                style={{
                  borderTop: '0.5px solid #D8D8D8',
                  width: '95%',
                  position: 'relative',
                  bottom: '6px',
                }}
              />
              <Box
                // padding="20px"
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography fontSize="1rem!important" fontWeight={700}>
                  Today&apos;s total
                </Typography>
                <Stack
                  flexDirection={
                    order?.coaching?.[0]?.price === 630
                      ? 'column'
                      : 'row-reverse'
                  }
                  alignItems={
                    order?.coaching?.[0]?.price === 630 ? 'flex-end' : 'center'
                  }
                  gap={1}
                >
                  <Typography
                    color="#00531B"
                    fontSize="1rem!important"
                    fontWeight={700}
                  >
                    {order?.coaching?.[0]?.price === 630
                      ? `$${totalAmount} for first 3 months`
                      : `$${totalAmount}/month`}
                  </Typography>
                  <Typography
                    variant="h4"
                    fontSize="1rem!important"
                    sx={{ textDecoration: 'line-through' }}
                  >
                    {order?.coaching?.[0]?.price === 630
                      ? '$891 every 3 months after '
                      : '$297'}
                  </Typography>
                </Stack>
              </Box>
            </WhiteBox>
          </Stack>
          <PaymentForm amount={totalAmount} buttonText={`Confirm`} />
          <TermsOfUse
            coaching={order.coaching}
            hasAppointment={!!appointment}
          />
        </Grid>
      </Container>
    </ABTestContext>
  );
};

export default BundledCheckoutV2;
