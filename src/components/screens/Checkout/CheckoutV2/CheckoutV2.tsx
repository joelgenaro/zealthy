import {
  useActivePatientReferralRedeem,
  useCouponCodeRedeem,
  useIsBundled,
  useLanguage,
  usePatient,
  useVWOVariationName,
} from '@/components/hooks/data';
import { useCanRemove } from '@/components/hooks/useCanRemove';
import { useIntakeState } from '@/components/hooks/useIntake';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { usePatientState } from '@/components/hooks/usePatient';
import { useSelector } from '@/components/hooks/useSelector';
import { useTotalAmount } from '@/components/hooks/useTotalAmount';
import BottlePhoneZPlan from '@/components/screens/Checkout/CheckoutV2/asset/BottlePhoneZPlan';
import Package from '@/components/shared/icons/Package';
import PrivacyShield from '@/components/shared/icons/PrivacyShield';
import Spinner from '@/components/shared/Loading/Spinner';
import TermsOfUse from '@/components/shared/TermsOfUse';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { useVWO } from '@/context/VWOContext';
import { Divider, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/system';
import { useEffect, useState } from 'react';
import getConfig from '../../../../../config';
import CheckoutPopUpModalGLP1 from '../../GLP1Treatment/GLP1ChcekoutPopUp/CheckoutPopUpModalGLP1';
import CoachingCard from '../components/CoachingCard';
import { Price } from '../components/OrderSummary/components/Fee';
import PaymentForm from '../components/PaymentForm';
import { Order } from '../types';
import BottlePhone from './asset/BottlePhone';
import BundledReview from './asset/BundledReview';
import CheckoutReview from './asset/CheckoutReview';
import CouponTag from './asset/CouponTag';
import PlanSelection from './asset/PlanSelection';

const CheckoutV2 = () => {
  const [iszealthy96Applied, setIszealthy96Applied] = useState(false);

  const [order, setOrder] = useState<Order>({
    subscriptions: [],
    visit: null,
    medications: [],
    coaching: [],
    consultation: [],
  });

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;
  const theme = useTheme();

  const { data: couponCodeRedeem } = useCouponCodeRedeem();
  const { data: patientReferralRedeem } = useActivePatientReferralRedeem();
  const { weight, region } = usePatientState();
  const totalAmount = useTotalAmount(order);
  const isMobile = useIsMobile();
  const [poundsLost, setPoundsLost] = useState(0);
  const coaching = useSelector(store => store.coaching);
  const appointment = useSelector(store =>
    store.appointment.find(a => a.appointment_type === 'Provider')
  );
  const { data: patient } = usePatient();
  const vwo = useVWO();
  const language = useLanguage();
  const variant6822_2 = useVWOVariationName('6822-2');
  const variant6822_3 = useVWOVariationName('6822-3');
  const { data: variant7895 } = useVWOVariationName('7895');
  const isVar1_6822_2 = variant6822_2?.data?.variation_name === 'Variation-1';
  const isVar1_6822_3 = variant6822_3?.data?.variation_name === 'Variation-1';
  const [variation7861, setVariation7861] = useState<string | undefined>();
  const [variationsLoading, setVariationsLoading] = useState<boolean>(false);
  const { data: isBundled } = useIsBundled();

  const [isModalOpen, setIsModalOpen] = useState(false);

  let billedText = 'Billed every 4 weeks. Cancel anytime.';

  let getStarted = 'Get started for ';
  let promoApplied = 'Promo applied! You got';
  let off = 'off';
  let thenText = 'Then';
  let afterPromoText = 'after promo expires';

  const canRemove = useCanRemove(order);
  const { specificCare, potentialInsurance, variant } = useIntakeState();
  const variant5284 =
    ['IL', 'TX'].includes(patient?.region!) &&
    specificCare === SpecificCareOption.WEIGHT_LOSS &&
    ![
      PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
      PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
    ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
      ? vwo.getVariationName('5284', String(patient?.id!))
      : '';

  const StrikethroughText = styled(Typography)`
    text-decoration: line-through;
  `;

  const variant6471 =
    variant === '6471' &&
    specificCare === SpecificCareOption.WEIGHT_LOSS &&
    potentialInsurance === null;

  const isSemaglutideBundled = [
    PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
    PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
  ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT);

  useEffect(() => {
    if (weight) {
      const newWeight = Math.floor(weight * 0.8);
      const poundsLost = weight - newWeight;
      setPoundsLost(poundsLost);
    }
  }, [weight]);

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
              require_payment_now: true,
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
    patientReferralRedeem,
    specificCare,
  ]);

  const pageHeader = isSemaglutideBundled
    ? 'Unlock access to GLP-1 weight loss'
    : language === 'esp'
    ? `Predecimos que perderas ${poundsLost} libras`
    : `We predict you will lose ${poundsLost} pounds.`;

  const strikethroughPrice = isSemaglutideBundled ? '$297' : '$135';

  const descriptionText = isSemaglutideBundled
    ? 'Compounded Semaglutide'
    : language === 'esp'
    ? 'Programa de Pérdida de Peso Individualizado y Dirigido por Médicos'
    : 'Doctor-led & Individualized Weight Loss Program';

  if (language === 'esp') {
    billedText = 'Facturado cada 4 semanas. Cancela en cualquier momento.';
    getStarted = 'Empieza por ';
    promoApplied = 'Promocion aplicada! Aquí tiene';
    off = 'de rebaja';
    thenText = 'Entonces';
    afterPromoText = 'después de que expire la promoción';
  }

  if (
    ['Variation-1', 'Variation-2'].includes(variant7895?.variation_name ?? '')
  ) {
    billedText =
      'Treatment may include meds like Wegovy and Zepbound, along with ongoing support to ensure lasting results.';
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsModalOpen(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const activateVariants = async () => {
      if (
        patient &&
        ['MA', 'NE', 'MD', 'WI', 'UT', 'GA'].includes(patient.region!) &&
        !isBundled &&
        variant !== 'twelve-month'
      ) {
        const variation = await vwo?.activate('7861_1', patient);
        setVariation7861(variation!);
        setVariationsLoading(true);
      }
    };
    activateVariants();
  }, [patient, vwo]);

  useEffect(() => {
    setVariationsLoading(false);
  }, [variation7861]);

  if (variationsLoading) {
    return <Spinner />;
  }

  return (
    <Container maxWidth="md">
      <Grid
        container
        gap={{ sm: '25px', xs: '16px' }}
        maxWidth="590px"
        margin="0 auto"
        direction="column"
      >
        {!['Variation-1', 'Variation-2'].includes(
          variant7895?.variation_name ?? ''
        ) ? (
          <Typography variant="h2">{pageHeader}</Typography>
        ) : null}
        <Stack
          sx={{
            borderRadius: '12px',
            width: '100%',
            gap: '0.5rem',
          }}
        >
          <Box
            display="flex"
            sx={{
              alignItems: 'center',
              gap: isSemaglutideBundled ? '1.8rem' : '1rem',
            }}
          >
            {['Zealthy', 'FitRx'].includes(siteName ?? '') ? (
              <BottlePhone />
            ) : (
              <BottlePhoneZPlan />
            )}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <Typography
                variant="h3"
                fontWeight={
                  isSemaglutideBundled
                    ? 700
                    : ['Zealthy', 'FitRx'].includes(siteName ?? '')
                    ? 400
                    : 700
                }
                {...(siteName === 'Z-Plan' && {
                  color: '#000',
                })}
              >
                {descriptionText}
              </Typography>
              <Typography variant="h4">{billedText} </Typography>
            </Box>
            {order?.coaching?.[0]?.name?.includes(
              'Zealthy 3-Month Weight Loss'
            ) ? null : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: isMobile ? '12px 8px' : '24px 16px',
                  backgroundColor: ['Zealthy', 'FitRx'].includes(siteName ?? '')
                    ? '#04581D'
                    : theme.palette.primary.main,
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  gap: '0.5rem',
                  width: !variant6471 ? 'fit-content' : '40%',
                  textAlign: !variant6471 ? '' : 'right',
                }}
              >
                <Typography
                  fontWeight={!variant6471 ? 700 : 600}
                  {...(siteName === 'Z-Plan' && {
                    color: '#000',
                  })}
                  fontSize={isMobile ? '1rem!important' : '1.7rem!important'}
                >
                  {variant6471 ? `$${totalAmount} today` : `$${totalAmount}`}
                </Typography>

                {/*  */}
                {!variant6471 ? (
                  <StrikethroughText
                    fontSize={isMobile ? '1rem!important' : '1.7rem!important'}
                    {...(siteName === 'Z-Plan' && {
                      color: '#000',
                    })}
                  >
                    {strikethroughPrice}
                  </StrikethroughText>
                ) : (
                  <Typography fontSize="1.1rem!important">
                    $39 if prescribed
                  </Typography>
                )}

                {/*  */}
              </Box>
            )}
          </Box>
          {isSemaglutideBundled ? (
            <BundledReview />
          ) : (
            <>
              {' '}
              {['Zealthy', 'FitRx'].includes(siteName ?? '') &&
              !['Variation-1', 'Variation-2'].includes(
                variant7895?.variation_name ?? ''
              ) ? (
                <hr
                  style={{
                    borderTop: '0.5px solid #D8D8D8',
                    width: '95%',
                    position: 'relative',
                    bottom: '6px',
                  }}
                />
              ) : null}
              {['Variation-1', 'Variation-2'].includes(
                variant7895?.variation_name ?? ''
              ) ? (
                <Box
                  border={1}
                  borderRadius={4}
                  padding={3}
                  borderColor="lightgray"
                >
                  <Stack gap={2}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">
                        Monthly membership
                      </Typography>
                      <Typography variant="body2">
                        ${coaching[0].price}
                      </Typography>
                    </Stack>
                    {coaching[0].discounted_price ? (
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">
                          First month promo
                        </Typography>
                        <Typography
                          fontWeight="bold"
                          color="green"
                          variant="body2"
                        >
                          -$
                          {coaching[0].price - coaching[0].discounted_price}
                        </Typography>
                      </Stack>
                    ) : null}
                    <Divider />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" fontWeight="bold">
                        Total
                      </Typography>
                      <Typography fontWeight="bold" variant="body2">
                        ${coaching[0].discounted_price}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              ) : (
                coaching.map(coach => (
                  <CoachingCard
                    isPromoApplied={iszealthy96Applied}
                    key={coach.id}
                    coach={coach}
                    updateOrder={setOrder}
                    canRemove={canRemove}
                    referral={patientReferralRedeem}
                    couponCodeRedeem={couponCodeRedeem!}
                    specificCare={specificCare!}
                  />
                ))
              )}
            </>
          )}
          {['Zealthy', 'FitRx'].includes(siteName ?? '') &&
          !['Variation-1', 'Variation-2'].includes(
            variant7895?.variation_name ?? ''
          ) ? (
            <hr
              style={{
                borderTop: '0.5px solid #D8D8D8',
                width: '95%',
                position: 'relative',
                bottom: '1px',
              }}
            />
          ) : null}
          {variant5284 === 'Variation-1' ? (
            <>
              <PlanSelection updateOrder={setOrder} />
              <hr
                style={{
                  borderTop: '0.5px solid #D8D8D8',
                  width: '95%',
                  position: 'relative',
                  bottom: '1px',
                }}
              />{' '}
            </>
          ) : null}

          {variant6471 ||
          ['Variation-1', 'Variation-2'].includes(
            variant7895?.variation_name ?? ''
          ) ? null : (
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
                {!isSemaglutideBundled ? (
                  coaching?.[0]?.name === 'Zealthy 3-Month Weight Loss' ? (
                    <>
                      <Typography fontWeight={800} sx={{ color: '#00531B' }}>
                        {language === 'esp'
                          ? `¡Promoción aplicada! Recibiste $130 de rebaja`
                          : `Promo applied! You got $130 off`}
                      </Typography>
                      <Typography>
                        {language === 'esp'
                          ? `Luego $${
                              coaching?.[0]?.price / 3
                            }/mes (pagado cada 3 meses) después de que expire la promoción`
                          : `Then $${
                              coaching?.[0]?.price / 3
                            }/month (paid every 3 months) after promo expires`}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography
                        fontWeight={800}
                        sx={{
                          color: ['Zealthy', 'FitRx'].includes(siteName ?? '')
                            ? '#00531B'
                            : theme.palette.primary.light,
                        }}
                      >
                        {` ${promoApplied} $${
                          coaching?.[0]?.price - totalAmount
                        } ${off}`}
                      </Typography>
                      <Typography>{`${thenText} $${coaching?.[0]?.price} ${afterPromoText}`}</Typography>
                    </>
                  )
                ) : (
                  <>
                    <Typography fontWeight={800} sx={{ color: '#00531B' }}>
                      {`Promo applied! You got $${
                        coaching?.[0]?.price - totalAmount
                      } off your first month`}
                    </Typography>
                    <Typography>{`Then $${coaching?.[0]?.price} on your next refill request`}</Typography>
                  </>
                )}
              </Box>
            </Box>
          )}
          {!['Variation-1', 'Variation-2'].includes(
            variant7895?.variation_name ?? ''
          ) ? (
            <Box
              display="flex"
              justifyContent="space-between"
              sx={{
                padding: '24px',
                border: '2px solid var(--secondary-contrast, #1B1B1B)',
                borderRadius: '12px',
              }}
            >
              <Typography fontWeight="bold">
                {language === 'esp' ? 'Total de hoy' : "Today's total"}
              </Typography>
              {
                !variant6471 ? (
                  <Price
                    discountPrice={
                      coaching?.[0]?.discounted_price
                        ? `${
                            coaching?.[0]?.discounted_price -
                            (couponCodeRedeem?.coupon_code?.value ?? 0)
                          }`
                        : undefined
                    }
                    price={`${coaching?.[0]?.price} ${
                      coaching?.[0]?.discounted_price ? '' : '/ month'
                    }`}
                  />
                ) : (
                  <Price
                    discountPrice={'0'}
                    price={`49`}
                    variant6471={variant6471}
                  />
                )

                //
              }
            </Box>
          ) : null}

          {isSemaglutideBundled ? (
            <Box
              display="flex"
              sx={{
                alignItems: 'center',
                padding: '0px 24px',
                gap: '1rem',
              }}
            >
              <Package />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <Typography fontWeight={800} sx={{ color: '#00531B' }}>
                  {`Delivered within a week`}
                </Typography>
              </Box>
            </Box>
          ) : null}
        </Stack>
        {isSemaglutideBundled ? (
          <Box
            display="flex"
            sx={{
              gap: '1rem',
              backgroundColor: '#E2F6E9',
              borderRadius: '12px',
              padding: '24px',
            }}
          >
            <PrivacyShield />
            <Typography fontWeight={700} sx={{ color: '#00531B' }}>
              Did you know: Compounded Semaglutide contains the same active
              ingredient as Ozempic and Wegovy. Similar results at a much lower
              cost!
            </Typography>
          </Box>
        ) : null}
        {!['Variation-1', 'Variation-2'].includes(
          variant7895?.variation_name ?? ''
        ) ? (
          <CheckoutReview />
        ) : null}

        {['Variation-1', 'Variation-2'].includes(
          variant7895?.variation_name ?? ''
        ) ? (
          <Box bgcolor="#e5f9ec" borderRadius={4} padding={3}>
            <Typography variant="caption">
              If you&apos;re not prescribed medication, your $39 will be
              refunded. The cost of medication is separate.
            </Typography>
          </Box>
        ) : null}

        <PaymentForm
          amount={totalAmount}
          buttonText={`${getStarted} $${totalAmount}`}
        />

        <TermsOfUse
          coaching={order.coaching}
          hasAppointment={!!appointment}
          variant6471={variant6471}
          short={variant7895?.variation_name === 'Variation-1'}
        />
      </Grid>
      {(specificCare === SpecificCareOption.ANXIETY_OR_DEPRESSION ||
        isVar1_6822_3) &&
      specificCare !== SpecificCareOption.WEIGHT_LOSS ? (
        <CheckoutPopUpModalGLP1 open={isModalOpen} onClose={handleModalClose} />
      ) : null}
    </Container>
  );
};

export default CheckoutV2;
