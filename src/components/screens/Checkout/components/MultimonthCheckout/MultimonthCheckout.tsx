import Router from 'next/router';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Container, Grid, Stack, Typography } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Title from '@/components/shared/Title';
import DeliveryFee from '../../components/DeliveryFee';
import MultiCoachingCard from '../CoachingCard/MultiCoachingCard';
import TotalToday from '../../components/TotalToday';
import MultiTermsOfUse from '@/components/shared/TermsOfUse/MultiTermsOfUse';
import WhiteBox from '@/components/shared/layout/WhiteBox';
import ZealthySubscriptionCard from '../../components/ZealthySubscriptionCard';
import MedicationsFee from '../../components/OrderSummary/components/MedicationsFee';
import { Order } from '../../types';
import { Pathnames } from '@/types/pathnames';
import { useSelector } from '@/components/hooks/useSelector';
import { useTotalAmount } from '@/components/hooks/useTotalAmount';
import { useCheckoutTitle } from '@/components/hooks/useCheckoutTitle';
import { useCanRemove } from '@/components/hooks/useCanRemove';
import { useTotalDiscount } from '@/components/hooks/useTotalDiscount';
import PaymentForm from '../../components/PaymentForm';
import { useAddZealthySubscription } from '@/components/hooks/useAddZealthySubscription';
import ProviderReviewAlert from '../../components/ProviderReviewAlert';
import { useCheckoutDescription } from '@/components/hooks/useCheckoutDescription';
import { useIntakeState } from '@/components/hooks/useIntake';
import { useCalculateSpecificCare } from '@/components/hooks/useCalculateSpecificCare';
import InsuranceCovered from '@/components/shared/InsuranceCovered';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';
import {
  useCouponCodeRedeem,
  useActivePatientReferralRedeem,
  usePatient,
} from '@/components/hooks/data';
import { MultiItem } from './components/MultiItem';
import { Database } from '@/lib/database.types';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { trackWithDeduplication } from '@/utils/freshpaint/utils';

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

const MultimonthCheckout = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [order, setOrder] = useState<Order>({
    subscriptions: [],
    visit: null,
    medications: [],
    coaching: [],
    consultation: [],
  });
  const appointment = useSelector(store =>
    store.appointment.find(a => a.appointment_type === 'Provider')
  );
  const insurance = useSelector(store => store.insurance);
  const medications = useSelector(store => store.visit.medications);
  const visitId = useSelector(store => store.visit.id);
  const coaching = useSelector(store => store.coaching);
  const totalAmount = useTotalAmount(order);
  const title = useCheckoutTitle();
  const description = useCheckoutDescription();
  const canRemove = useCanRemove(order);
  const discount = useTotalDiscount();
  const showZealthySubscription = useAddZealthySubscription();
  const { data: patientReferralRedeem } = useActivePatientReferralRedeem();
  const { data: couponCodeRedeem } = useCouponCodeRedeem();
  const { specificCare } = useIntakeState();
  const calculatedSpecificCare = useCalculateSpecificCare();
  const { potentialInsurance } = useIntakeState();
  const { data: patient } = usePatient();
  const [weightLossSubscriptions, setWeightLossSubscriptions] = useState<
    SubscriptionOption[]
  >([]);

  const supabase = useSupabaseClient<Database>();

  const fetchWeightLossPlans = async () => {
    const { data: wlSubs } = await supabase
      .from('subscription')
      .select('*')
      .in('name', [
        'Zealthy Weight Loss',
        'Zealthy 3-Month Weight Loss',
        'Zealthy 6-Month Weight Loss',
        'Zealthy 12-Month Weight Loss',
      ]);

    const wlSubscriptions: SubscriptionOption[] = [];
    if (wlSubs) {
      for (const sub of wlSubs) {
        if (sub.name === 'Zealthy Weight Loss') {
          wlSubscriptions.push({
            ...sub,
            selected: coaching.some(el => el.price === sub.price),
            index: 0,
            isMostPopular: false,
            isBestValue: false,
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
            discountedPrice: 39,
          });
        }
        if (sub.name === 'Zealthy 3-Month Weight Loss')
          wlSubscriptions.push({
            ...sub,
            selected: coaching.some(el => el.price === sub.price),
            index: 1,
            isMostPopular: false,
            isBestValue: false,
            recurring: {
              interval: 'month',
              interval_count: 3,
            },
            discountedPrice: 253,
          });
        if (sub.name === 'Zealthy 6-Month Weight Loss')
          wlSubscriptions.push({
            ...sub,
            selected: coaching.some(el => el.price === sub.price),
            index: 2,
            isMostPopular: true,
            isBestValue: false,
            recurring: {
              interval: 'month',
              interval_count: 6,
            },
            discountedPrice: 513,
          });
        if (sub.name === 'Zealthy 12-Month Weight Loss')
          wlSubscriptions.push({
            ...sub,
            price: 1020,
            selected: coaching.some(el => el.price === 1020),
            index: 3,
            isMostPopular: false,
            isBestValue: true,
            recurring: {
              interval: 'month',
              interval_count: 12,
            },
            discountedPrice: 934,
          });
      }
      setWeightLossSubscriptions(
        wlSubscriptions.sort((a, b) => a.index - b.index)
      );
    }
  };

  const handleSelect = (index: number) => {
    const wlSubsCopy = [...weightLossSubscriptions];
    for (const wlOption of wlSubsCopy) {
      if (wlOption.index === index) {
        wlOption.selected = true;
      } else {
        wlOption.selected = false;
      }
    }
    setWeightLossSubscriptions(wlSubsCopy);
  };

  useEffect(() => {
    fetchWeightLossPlans();
  }, []);

  useEffect(() => {
    if (
      patient &&
      (specificCare == 'Weight loss' || calculatedSpecificCare == 'Weight loss')
    ) {
      trackWithDeduplication('weight-loss-checkout-page');
    }
  }, [specificCare, calculatedSpecificCare, patient]);

  useEffect(() => {
    trackWithDeduplication('checkout-page');
  }, [order]);

  useLayoutEffect(() => {
    if (!visitId) {
      Router.push(Pathnames.CARE_SELECTION);
      return;
    }
  }, [visitId]);

  return (
    <Container maxWidth="md">
      <Grid
        container
        gap={{ sm: '25px', xs: '16px' }}
        maxWidth="590px"
        margin="0 auto"
        direction="column"
      >
        <Stack gap={1}>
          <Title text={title} />
          {description && <Typography>{description}</Typography>}
        </Stack>

        <Stack width="inherit" direction="column" gap="16px">
          {potentialInsurance ===
            PotentialInsuranceOption.BLUE_CROSS_ILLINOIS &&
            !insurance.out_of_network && (
              <InsuranceCovered message="The partnership between Zealthy and your insurance has you covered!" />
            )}
          <ProviderReviewAlert />

          {showZealthySubscription ? (
            <ZealthySubscriptionCard updateOrder={setOrder} />
          ) : null}

          {coaching.map(coach => (
            <MultiCoachingCard
              key={coach.id}
              coach={coach}
              isMulti={true}
              updateOrder={setOrder}
              canRemove={canRemove}
              referral={patientReferralRedeem}
              couponCodeRedeem={couponCodeRedeem!}
              specificCare={specificCare!}
            />
          ))}

          {medications.map(medication => (
            <MedicationsFee
              key={medication.name}
              medication={medication}
              updateOrder={setOrder}
              canRemove={canRemove}
            />
          ))}
          {/* {potentialInsurance === 'OH' && order?.coaching.length ? (
              <WeightLossOhioOptions
                selected={order.coaching[0]}
                updateOrder={setOrder}
              />
            ) : null} */}
          <DeliveryFee />
          <WhiteBox
            sx={{ cursor: 'pointer' }}
            onClick={() => setIsDrawerOpen(prev => !prev)}
            padding="16px 24px"
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              gap={1}
            >
              <Typography>Upgrade your plan & save more</Typography>
              {isDrawerOpen ? (
                <ExpandLessIcon fontSize="large" />
              ) : (
                <ExpandMoreIcon fontSize="large" />
              )}
            </Stack>

            {isDrawerOpen
              ? weightLossSubscriptions?.map((sub, i) => (
                  <MultiItem
                    key={i}
                    subscription={sub}
                    handleSelect={(event: React.MouseEvent<HTMLDivElement>) => {
                      event.stopPropagation();
                      handleSelect(i);
                    }}
                  />
                ))
              : null}
          </WhiteBox>
          <TotalToday
            amount={totalAmount}
            discount={discount}
            showIcon={false}
          />
        </Stack>
        <PaymentForm amount={totalAmount} couponCode={couponCodeRedeem} />
        <MultiTermsOfUse
          coaching={order.coaching}
          hasAppointment={!!appointment}
        />
      </Grid>
    </Container>
  );
};

export default MultimonthCheckout;
