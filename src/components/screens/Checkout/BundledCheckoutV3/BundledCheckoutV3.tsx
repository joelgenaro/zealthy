import {
  Box,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
  styled,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import HeaderImage from './assets/HeaderImages';
import WhiteBox from '@/components/shared/layout/WhiteBox';
import StyledChip from '@/components/shared/Chip/StyledChip';
import { ProfileState } from '@/context/AppContext/reducers/types/profile';
import { useAnswerSelect } from '@/components/hooks/useAnswer';
import { CodedAnswer } from '@/context/AppContext/reducers/types/answer';
import { useSelector } from '@/components/hooks/useSelector';
import { Order } from '../types';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { useIntakeState } from '@/components/hooks/useIntake';
import {
  useActivePatientReferralRedeem,
  useCouponCodeRedeem,
} from '@/components/hooks/data';
import { useCanRemove } from '@/components/hooks/useCanRemove';
import PaymentForm from '../components/PaymentForm';
import TermsOfUse from '@/components/shared/TermsOfUse';
import { useTotalAmount } from '@/components/hooks/useTotalAmount';
import { usePatientState } from '@/components/hooks/usePatient';
import { useVWO } from '@/context/VWOContext';
import ABTestContext from '@/context/ABTestContext';
import TermsOfUseSemaglutideBundledV2 from './components/TermsOfUseSemaglutideBundledV2';
import { useIsMobile } from '@/components/hooks/useIsMobile';

interface CheckoutProps {
  patient: ProfileState;
}

const itemsList = [
  'Provider evaluation',
  'Free check-ins',
  'Free shipping',
  'Ongoing medical support',
];

const BundledCheckoutV3 = ({ patient }: CheckoutProps) => {
  const isMobile = useIsMobile();
  const [order, setOrder] = useState<Order>({
    subscriptions: [],
    visit: null,
    medications: [],
    coaching: [],
    consultation: [],
  });
  const coaching = useSelector(store => store.coaching);
  const appointment = useSelector(store =>
    store.appointment.find(a => a.appointment_type === 'Provider')
  );
  const vwoContext = useVWO();
  const { potentialInsurance, specificCare } = useIntakeState();
  const patientState = usePatientState();

  const answer = useAnswerSelect(
    a => a['WEIGHT_L_Q4']?.answer
  ) as CodedAnswer[];
  const { data: couponCodeRedeem } = useCouponCodeRedeem();
  const canRemove = useCanRemove(order);
  const totalAmount = useTotalAmount(order);

  let variationName5865;

  if (
    ['CO', 'IN', 'LA', 'NJ', 'SC', 'WI', 'TN', 'CT'].includes(
      patientState?.region!
    ) &&
    [PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED]?.includes(
      potentialInsurance || PotentialInsuranceOption.DEFAULT
    )
  ) {
    variationName5865 = vwoContext?.getVariationName(
      '15685',
      String(patientState?.id)
    );
  }

  const weightLossGoal = useMemo(() => {
    switch (answer?.[0]?.valueCoding?.display) {
      case 'Lose 1-20 lbs for good':
        return '1-20 lbs';
      case 'Lose 21-50 lbs for good':
        return '21-50 lbs';
      case 'Lose over 50 lbs for good':
        return 'Over 50 lbs';
      case 'Maintain my weight and get fit':
        return 'Maintain and get fit';
    }
  }, [answer]);

  const isSemaglutideBundled = [
    PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
    PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
  ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT);

  const incorrectAnswers = ['WEIGHT_L_Q4_A5'].includes(
    answer?.[0]?.valueCoding?.code
  );

  const StrikethroughText = styled(Typography)`
    text-decoration: line-through;
  `;

  useEffect(() => {
    if (isSemaglutideBundled) {
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
              require_payment_now: false,
              type: coach.type,
            }),
        }));
      });
    }
  }, [
    canRemove,
    coaching,
    couponCodeRedeem,
    isSemaglutideBundled,
    specificCare,
  ]);

  return (
    <ABTestContext value={variationName5865 || ''}>
      <Container maxWidth="md">
        <Grid
          container
          gap={{ sm: '25px', xs: '16px' }}
          maxWidth="590px"
          margin="0 auto"
          direction="column"
        >
          <Box>
            <HeaderImage style={{ width: '590px' }} isMobile={isMobile} />
          </Box>
          <Typography variant="h2" sx={{ color: '#367A35' }}>
            Save your payment details
          </Typography>
          <Stack>
            <WhiteBox padding="16px 24px" gap={1}>
              <StyledChip
                label="You won’t be charged until prescribed"
                variant="filled"
                sx={{
                  color: '#005315',
                  fontSize: '0.8rem!important',
                  fontWeight: '600',
                  width: 'fit-content',
                  background:
                    'linear-gradient(90deg, #6EF79B 0.73%, #CCFFE1 99.63%)',
                  padding: '12px',
                  justifyContent: 'center',
                  alignSelf: 'center',
                }}
              />
              <Typography variant="h3" fontSize="1.1rem!important">
                {patient.first_name}’s Treatment
              </Typography>
              <Box>
                <Typography fontWeight={600}>
                  Semaglutide Weekly Injections
                </Typography>
                <Typography>2.5 mg vial</Typography>
              </Box>
              <Box>
                <Typography fontWeight={600}>Weekly Dosage</Typography>
                <Typography>Inject 0.25 mg weekly for four weeks</Typography>
              </Box>
              {!incorrectAnswers ? (
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography fontWeight={600}>
                    Based on your goal to lose
                  </Typography>
                  <Typography
                    sx={{
                      border: '1px solid #367A35',
                      borderRadius: '8px',
                      padding: '8px',
                    }}
                  >
                    {weightLossGoal}
                  </Typography>
                </Box>
              ) : null}
              <hr
                style={{
                  borderTop: '0.5px solid #D8D8D8',
                  width: '100%',
                  position: 'relative',
                  bottom: '1px',
                }}
              />
              {itemsList.map(item => (
                <Box key={item} display="flex" justifyContent="space-between">
                  <Typography fontWeight={600}>{item}</Typography>
                  <Typography fontWeight={600} sx={{ color: '#008A2E' }}>
                    FREE
                  </Typography>
                </Box>
              ))}
              <hr
                style={{
                  borderTop: '0.5px solid #D8D8D8',
                  width: '100%',
                  position: 'relative',
                  bottom: '1px',
                }}
              />
              <Box display="flex" justifyContent="space-between">
                <Typography fontWeight={600}>Total</Typography>
                <Box display="flex" sx={{ gap: '0.2rem' }}>
                  <StrikethroughText>{`$${coaching?.[0]?.price}/mo`}</StrikethroughText>
                  <Typography fontWeight={600}>
                    ${coaching?.[0]?.discounted_price}
                  </Typography>
                </Box>
              </Box>
              <StyledChip
                label="Refills every month, cancel anytime"
                variant="filled"
                sx={{
                  color: '#005315',
                  fontSize: '0.8rem!important',
                  fontWeight: '600',
                  width: 'fit-content',
                  background:
                    'linear-gradient(90deg, #6EF79B 0.73%, #CCFFE1 99.63%)',
                  padding: '12px',
                  justifyContent: 'center',
                  alignSelf: 'center',
                }}
              />
              <hr
                style={{
                  borderTop: '0.5px solid #D8D8D8',
                  width: '100%',
                  position: 'relative',
                  bottom: '1px',
                }}
              />
              <Box display="flex" justifyContent="space-between">
                <Typography fontWeight={600}>DUE TODAY</Typography>
                <Typography fontWeight={600}>$00.00</Typography>
              </Box>
              <Typography sx={{ color: '#00721C', alignSelf: 'center' }}>
                About 1 in 3 adults lose 20% of their body weight with
                semaglutide*
              </Typography>
            </WhiteBox>
            <Typography
              fontWeight={700}
              sx={{
                borderRadius: '0px 0px 6px 6px',
                background: '#00531B',
                color: '#FFF',
                padding: '8px 12px',
                width: 'fit-content',
                alignSelf: 'center',
              }}
            >
              You won’t be charged until prescribed
            </Typography>
          </Stack>
          <PaymentForm
            amount={totalAmount}
            buttonText={`PAY $${totalAmount} DUE TODAY`}
          />
          <TermsOfUseSemaglutideBundledV2 />
        </Grid>
      </Container>
    </ABTestContext>
  );
};

export default BundledCheckoutV3;
