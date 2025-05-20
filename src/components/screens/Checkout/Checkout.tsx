import Router from 'next/router';
import {
  useEffect,
  useLayoutEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { Container, Grid, Stack, Typography, Box } from '@mui/material';
import Title from '@/components/shared/Title';
import DeliveryFee from './components/DeliveryFee';
import CoachingCard from './components/CoachingCard';
import TotalToday from './components/TotalToday';
import CashVisitPrice from './components/CashVisitPrice';
import TermsOfUse from '@/components/shared/TermsOfUse';
import WhiteBox from '@/components/shared/layout/WhiteBox';
import AppointmentCard from './components/AppointmentCard';
import InsuranceVisitPrice from './components/InsuranceVisitPrice';
import ZealthySubscriptionCard from './components/ZealthySubscriptionCard';
import { Order } from './types';
import { Pathnames } from '@/types/pathnames';
import { useSelector } from '@/components/hooks/useSelector';
import { useTotalAmount } from '@/components/hooks/useTotalAmount';
import { useCheckoutTitle } from '@/components/hooks/useCheckoutTitle';
import { useCanRemove } from '@/components/hooks/useCanRemove';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import { useTotalDiscount } from '@/components/hooks/useTotalDiscount';
import PaymentForm from './components/PaymentForm';
import { useAddZealthySubscription } from '@/components/hooks/useAddZealthySubscription';
import ProviderReviewAlert from './components/ProviderReviewAlert';
import { useCheckoutDescription } from '@/components/hooks/useCheckoutDescription';
import { useIntakeState } from '@/components/hooks/useIntake';
import { useInvoice } from '@/components/hooks/useInvoice';
import WeightLossOhioOptions from './components/WeightLossOhioOptions';
import InsuranceCovered from '@/components/shared/InsuranceCovered';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import {
  useActivePatientReferralRedeem,
  useCouponCodeRedeem,
  useVWOVariationName,
} from '@/components/hooks/data';
import ConsultationFee from './components/ConsultationFee';
import MedicationsFee from './components/OrderSummary/components/MedicationsFee';
import TreatmentModal from '../Question/components/FemaleHairLoss/components/TreatmentModal';
import OralSemaglutideCheckoutPlan from './components/OralSemaglutideCheckoutPlan';
import TermsOfUseOralSemaglutideBundled from './components/TermsOfUseSemaglutideBundled';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import CheckoutPopUpModalGLP1 from '../GLP1Treatment/GLP1ChcekoutPopUp/CheckoutPopUpModalGLP1';
import BottlePhone from './CheckoutV2/asset/BottlePhone';
import { styled } from '@mui/system';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import CouponTag from './CheckoutV2/asset/CouponTag';
import CheckoutReview from './CheckoutV2/asset/CheckoutReview';
import { trackWithDeduplication } from '@/utils/freshpaint/utils';

const isWeightLossOnly = (potentialInsurance: PotentialInsuranceOption) => {
  return ![
    PotentialInsuranceOption.MEDICAID_ACCESS_FLORIDA,
    PotentialInsuranceOption.MEDICARE_ACCESS_FLORIDA,
    PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
    PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
  ].includes(potentialInsurance);
};

const StrikethroughText = styled(Typography)`
  text-decoration: line-through;
`;

const Checkout = () => {
  const supabase = useSupabaseClient<Database>();
  const [order, setOrder] = useState<Order>({
    subscriptions: [],
    visit: null,
    medications: [],
    coaching: [],
    consultation: [],
  });
  const currentAmount = useTotalAmount(order);
  const isMobile = useIsMobile();
  const appointment = useSelector(store =>
    store.appointment.find(a => a.appointment_type === 'Provider')
  );
  const insurance = useSelector(store => store.insurance);
  const medications = useSelector(store => store.visit.medications);
  const visitId = useSelector(store => store.visit.id);
  const coaching = useSelector(store => store.coaching);
  const consultation = useSelector(store => store.consultation);
  const title = useCheckoutTitle();
  const description = useCheckoutDescription();
  const canRemove = useCanRemove(order);
  const discount = useTotalDiscount();
  const showZealthySubscription = useAddZealthySubscription();
  const { data: patientReferralRedeem } = useActivePatientReferralRedeem();
  const { data: couponCodeRedeem } = useCouponCodeRedeem();
  const { specificCare } = useIntakeState();
  const { potentialInsurance, variant } = useIntakeState();
  const { hasPaidInvoiceWithFirstMonthDiscount } = useInvoice();
  const [totalAmount, setTotalAmount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const variant6822_2 = useVWOVariationName('6822-2');
  const { data: variation7865_3 } = useVWOVariationName('7865_3');
  const variant6822_3 = useVWOVariationName('6822-3');
  const isVar1_6822_2 = variant6822_2?.data?.variation_name === 'Variation-1';
  const isVar1_6822_3 = variant6822_3?.data?.variation_name === 'Variation-1';

  useEffect(() => {
    const updateTotalAmount = async () => {
      const monthlyWeightLossPlanPrice = {
        default: 135,
        discounted: 39,
      };
      const priceDifference =
        monthlyWeightLossPlanPrice.default -
        monthlyWeightLossPlanPrice.discounted;
      const hasDiscount = await hasPaidInvoiceWithFirstMonthDiscount();
      const calculatedAmount =
        hasDiscount && specificCare === SpecificCareOption.WEIGHT_LOSS
          ? currentAmount + priceDifference
          : currentAmount;
      setTotalAmount(calculatedAmount);
    };
    updateTotalAmount();
  }, [
    order.subscriptions,
    order.visit,
    order.medications,
    order.coaching,
    order.consultation,
    specificCare,
    hasPaidInvoiceWithFirstMonthDiscount,
    insurance,
    couponCodeRedeem,
    patientReferralRedeem,
    setTotalAmount,
    order,
  ]);

  useEffect(() => {
    trackWithDeduplication('checkout-page');
  }, [order]);

  useLayoutEffect(() => {
    if (!visitId) {
      Router.push(Pathnames.CARE_SELECTION);
      return;
    }
  }, [visitId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsModalOpen(true);
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const combineMenopauseMeds = useCallback(
    (menopauseMeds: typeof medications) => {
      if (!menopauseMeds.length) return null;
      const totalPrice = menopauseMeds.reduce(
        (acc, m) => acc + (m.price ?? 0),
        0
      );
      const first = menopauseMeds[0];
      const combinedMeds = {
        ...first,
        name: `Menopause Medication - $${totalPrice}`,
        price: totalPrice,
        medication_quantity_ids: menopauseMeds.map(
          m => m.medication_quantity_id
        ),
        menopause_meds: menopauseMeds,
      };

      return combinedMeds;
    },
    []
  );

  const menopauseCombinedMedication = useMemo(() => {
    if (specificCare !== SpecificCareOption.MENOPAUSE) return null;
    return combineMenopauseMeds(medications);
  }, [combineMenopauseMeds, medications, specificCare]);

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
        {specificCare === SpecificCareOption.WEIGHT_LOSS &&
          potentialInsurance !==
            PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED && (
            <Box
              display="flex"
              sx={{
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <BottlePhone />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <Typography variant="h3" fontWeight={400}>
                  Doctor-led & Individualized Weight Loss Program
                </Typography>
                <Typography variant="h4">
                  Billed every 4 weeks. Cancel anytime
                </Typography>
              </Box>
              {order?.coaching?.[0]?.name?.includes(
                'Zealthy 3-Month Weight Loss'
              ) ? null : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: isMobile ? '12px 8px' : '24px 16px',
                    backgroundColor: '#04581D',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    gap: '0.5rem',
                    width: 'fit-content',
                  }}
                >
                  <Typography
                    fontWeight={600}
                    fontSize={isMobile ? '1rem!important' : '1.7rem!important'}
                  >
                    {`$${totalAmount}`}
                  </Typography>
                  <StrikethroughText
                    fontSize={isMobile ? '1rem!important' : '1.7rem!important'}
                  >
                    {`$${totalAmount === 349 ? 449 : 297}`}
                  </StrikethroughText>
                </Box>
              )}
            </Box>
          )}
        {appointment ? <AppointmentCard appointment={appointment} /> : null}
        {potentialInsurance ===
        PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED ? (
          <OralSemaglutideCheckoutPlan
            updateOrder={setOrder}
            coach={coaching.find(c => c.type === CoachingType.WEIGHT_LOSS)}
          />
        ) : (
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
            {appointment &&
              !coaching.find(
                c => c.type === CoachingType.PERSONALIZED_PSYCHIATRY
              ) &&
              potentialInsurance !== 'Weight Loss Sync' && (
                <WhiteBox padding="16px 24px" gap="2px">
                  {insurance.plan_status === 'ACTIVE_COVERAGE' ? (
                    <InsuranceVisitPrice
                      visit={appointment}
                      insurance={insurance}
                      updateOrder={setOrder}
                    />
                  ) : (
                    <CashVisitPrice
                      visit={appointment}
                      updateOrder={setOrder}
                      canRemove={canRemove}
                    />
                  )}
                </WhiteBox>
              )}
            {coaching.length > 0 &&
              coaching.map(coach => (
                <CoachingCard
                  key={coach.id}
                  coach={coach}
                  updateOrder={setOrder}
                  canRemove={canRemove}
                  referral={patientReferralRedeem}
                  couponCodeRedeem={couponCodeRedeem!}
                  specificCare={specificCare!}
                />
              ))}
            {consultation.length > 0 &&
              consultation.map(c => (
                <ConsultationFee
                  key={c.type}
                  consultation={c}
                  updateOrder={setOrder}
                  canRemove={canRemove}
                />
              ))}
            {specificCare ===
            SpecificCareOption.SKINCARE ? null : medications.length > 0 ? (
              specificCare === SpecificCareOption.MENOPAUSE &&
              menopauseCombinedMedication ? (
                <MedicationsFee
                  key="menopause-combined-card"
                  medication={menopauseCombinedMedication}
                  updateOrder={setOrder}
                />
              ) : (
                medications.map(medication => (
                  <MedicationsFee
                    key={medication.name}
                    medication={medication}
                    updateOrder={setOrder}
                    canRemove={canRemove}
                  />
                ))
              )
            ) : null}
            {specificCare === SpecificCareOption.FEMALE_HAIR_LOSS && (
              <TreatmentModal />
            )}
            {potentialInsurance === 'OH' && order?.coaching.length ? (
              <WeightLossOhioOptions
                selected={order.coaching[0]}
                updateOrder={setOrder}
              />
            ) : null}
            {specificCare === SpecificCareOption.SKINCARE ? null : (
              <DeliveryFee />
            )}

            {specificCare === SpecificCareOption.WEIGHT_LOSS && (
              <Box
                display="flex"
                sx={{
                  alignItems: 'center',
                  padding: '24px',
                  gap: '1rem',
                }}
              >
                <CouponTag />
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <Typography fontWeight={800} sx={{ color: '#00531B' }}>
                    {`Promo applied! You got $${
                      totalAmount === 349 ? 100 : 80
                    } off`}
                  </Typography>
                  <Typography>
                    {`Then $${coaching?.[0]?.price} after promo expires`}
                  </Typography>
                </Box>
              </Box>
            )}

            <TotalToday
              amount={totalAmount}
              discount={discount}
              showIcon={false}
            />
          </Stack>
        )}
        {specificCare === SpecificCareOption.WEIGHT_LOSS &&
          potentialInsurance !==
            PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED && (
            <CheckoutReview />
          )}
        {(totalAmount !== 0 ||
          specificCare === SpecificCareOption.BIRTH_CONTROL ||
          specificCare === SpecificCareOption.PRIMARY_CARE ||
          (specificCare === SpecificCareOption.ENCLOMIPHENE &&
            variation7865_3?.variation_name !== 'Variation-1' &&
            variation7865_3?.variation_name !== 'Variation-2') ||
          specificCare === SpecificCareOption.PRE_WORKOUT ||
          specificCare === SpecificCareOption.SEX_PLUS_HAIR ||
          specificCare === SpecificCareOption.HAIR_LOSS ||
          specificCare === SpecificCareOption.FEMALE_HAIR_LOSS ||
          specificCare === SpecificCareOption.SLEEP ||
          specificCare === SpecificCareOption.MENOPAUSE ||
          specificCare === SpecificCareOption.ASYNC_MENTAL_HEALTH) && (
          <PaymentForm amount={totalAmount} couponCode={couponCodeRedeem} />
        )}
        {potentialInsurance ===
        PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED ? (
          <TermsOfUseOralSemaglutideBundled />
        ) : (
          <TermsOfUse
            coaching={order.coaching}
            hasAppointment={!!appointment}
            selectedMedication={
              specificCare === SpecificCareOption.MENOPAUSE &&
              menopauseCombinedMedication
                ? menopauseCombinedMedication
                : undefined
            }
          />
        )}
      </Grid>
      {(specificCare === SpecificCareOption.ANXIETY_OR_DEPRESSION ||
        isVar1_6822_3) &&
        specificCare !== SpecificCareOption.WEIGHT_LOSS && (
          <CheckoutPopUpModalGLP1
            open={isModalOpen}
            onClose={handleModalClose}
          />
        )}
    </Container>
  );
};

export default Checkout;
