import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  Box,
  useTheme,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Title from '@/components/shared/Title';
import TermsOfUse from '@/components/shared/TermsOfUse';
import ProviderReviewAlert from '../ProviderReviewAlert';
import Image from 'next/image';
import PaymentForm from '../PaymentForm';
import { usePatientOrders } from '@/components/hooks/data';
import EDHLProductImage from 'public/images/ed-hl/ed-hl-product-image.png';
import { useVisitActions } from '@/components/hooks/useVisit';
import {
  MedicationType,
  Medication,
} from '@/context/AppContext/reducers/types/visit';

const items: Medication[] = [
  {
    display_name: 'EDHL Medication',
    name: 'Tadalafil + Finasteride + Minoxidil',
    type: MedicationType.SEX_PLUS_HAIR,
    dosage: '5 MG / 1 MG / 2.5 MG',
    quantity: 150,
    recurring: {
      interval: 'month',
      interval_count: 5,
    },
    medication_quantity_id:
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 514 : 498,
    price: 245,
    discounted_price: 221,
  },
  {
    display_name: 'EDHL Medication',
    name: 'Tadalafil + Finasteride + Minoxidil',
    type: MedicationType.SEX_PLUS_HAIR,
    dosage: '5 MG / 1 MG / 2.5 MG',
    quantity: 90,
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
    medication_quantity_id:
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 513 : 497,
    price: 177,
    discounted_price: 159,
  },
  {
    display_name: 'EDHL Medication',
    name: 'Tadalafil + Finasteride + Minoxidil',
    type: MedicationType.SEX_PLUS_HAIR,
    dosage: '5 MG / 1 MG / 2.5 MG',
    quantity: 30,
    recurring: {
      interval: 'month',
      interval_count: 1,
    },
    medication_quantity_id:
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 512 : 496,
    price: 69,
    discounted_price: 62,
  },
];

const planIds = {
  monthly:
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
      ? 'price_1Q0uU4AO83GerSecAUh1KAO7'
      : 'price_1QGTRGAO83GerSecHwAw8JXn',
  quarterly:
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
      ? 'price_1Q0uYRAO83GerSecQb4s8Tdh'
      : 'price_1QGTSPAO83GerSec2dzABMEH',
  fiveMonthly:
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
      ? 'price_1Q0uZDAO83GerSecIW2R2C7w'
      : 'price_1QGTSfAO83GerSecy2eRpcsC',
};

const EDHLCheckout = () => {
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(1);
  const { data: patientOrders } = usePatientOrders();
  const isFirstPurchase = patientOrders?.length === 0;
  const theme = useTheme();
  const { addMedication } = useVisitActions();

  const options = useMemo(() => {
    return [
      {
        selectedOptionId: 0,
        duration: 'Every month',
        price: 69,
        discounted_price: 62,
        interval: 1,
        isRecommended: false,
        medication: items[2],
        planId: planIds.monthly,
        couponId: 'G1XZWbdj',
      },
      {
        selectedOptionId: 1,
        duration: 'Every 3 months',
        price: 177,
        discounted_price: 159,
        interval: 3,
        isRecommended: true,
        medication: items[1],
        planId: planIds.quarterly,
        couponId: 'G1XZWbdj',
      },
      {
        selectedOptionId: 2,
        duration: 'Every 5 months',
        price: 245,
        discounted_price: 221,
        interval: 5,
        isRecommended: false,
        medication: items[0],
        planId: planIds.fiveMonthly,
        couponId: 'G1XZWbdj',
      },
    ].map(option => {
      const originalTotalPrice = option.price;
      const discountedTotalPrice = isFirstPurchase
        ? option.discounted_price
        : originalTotalPrice;
      const pricePerMonth = isFirstPurchase
        ? discountedTotalPrice / option.interval
        : originalTotalPrice / option.interval;

      return {
        ...option,
        originalTotalPrice,
        discountedTotalPrice,
        pricePerMonth,
      };
    });
  }, [isFirstPurchase]);

  const selectedOption = useMemo(() => {
    if (selectedOptionId === null) return null;
    return options.find(option => option.selectedOptionId === selectedOptionId);
  }, [selectedOptionId, options]);

  const selectedMedication = selectedOption?.medication;

  const refillText = useMemo(() => {
    if (!selectedOption) return ['', ''];
    const firstSentence = `First subscription billed at $${selectedOption.discountedTotalPrice.toFixed(
      2
    )}.`;
    const secondSentence = `Then refills every ${
      selectedOption.interval
    } month(s) at $${selectedOption.originalTotalPrice.toFixed(
      2
    )}. Cancel anytime.`;
    return [firstSentence, <br key={'br'}></br>, secondSentence];
  }, [selectedOption]);

  useEffect(() => {
    if (selectedOption) {
      addMedication({
        ...selectedOption.medication,
        display_name: selectedOption.medication.display_name,
        price: isFirstPurchase
          ? selectedOption.discountedTotalPrice
          : selectedOption.originalTotalPrice,
        discounted_price: selectedOption.discountedTotalPrice,
        dosage: selectedOption.medication.dosage,
        quantity: selectedOption.medication.quantity,
        recurring: selectedOption.medication.recurring,
        medication_quantity_id:
          selectedOption.medication.medication_quantity_id,
        plan: selectedOption.planId,
      });
    }
  }, [selectedOptionId, isFirstPurchase]);

  const handleSelect = useCallback((optionId: number) => {
    setSelectedOptionId(optionId);
  }, []);

  const showTermsOfUse = () => {
    if (selectedOption) {
      return (
        selectedOption.medication.name === 'Tadalafil + Finasteride + Minoxidil'
      );
    }
    return false;
  };

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
          <Title text="Payment Details" />
          <Typography variant="h5">
            Add your payment details. We&apos;ll have a provider review your
            information.
          </Typography>
        </Stack>

        <Stack width="inherit" direction="column" gap="16px">
          <ProviderReviewAlert />

          <Paper
            sx={{
              padding: '16px 24px',
              borderRadius: '12px',
              background: '#FFF',
              boxShadow: '0px 4px 10px 0px rgba(0, 0, 0, 0.10)',
              border: '1px solid #D8D8D8',
            }}
          >
            <Stack gap="16px">
              <Typography variant="h2">Your plan includes:</Typography>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  backgroundColor: '#F6F6F6',
                  borderRadius: '8px',
                  padding: '8px',
                }}
              >
                <Stack gap={2}>
                  <Typography fontWeight={600}>Sex + Hair</Typography>
                  <Typography>{`Tadalafil 5 mg | Finasteride 1 mg | Minoxidil 2.5 mg`}</Typography>
                  <Stack direction="row" alignItems="center" sx={{ mt: 1 }}>
                    <CheckCircleIcon sx={{ color: 'green', mr: 1 }} />
                    <Typography>
                      <strong>Provider evaluation</strong>
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center">
                    <CheckCircleIcon sx={{ color: 'green', mr: 1 }} />
                    <Typography>
                      <strong>Online check-ins</strong>
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center">
                    <CheckCircleIcon sx={{ color: 'green', mr: 1 }} />
                    <Typography>
                      <strong>Free & discreet shipping</strong>
                    </Typography>
                  </Stack>
                </Stack>
                <Box>
                  <Image
                    src={EDHLProductImage}
                    alt="Sex + Hair product"
                    width={120}
                    height={100}
                    style={{ objectFit: 'contain' }}
                  />
                </Box>
              </Box>

              <Typography fontWeight={600} sx={{ mt: 3 }}>
                Select shipping frequency
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                It usually takes 3 to 6 months to start seeing hair regrowth.
                These plans help you save and stay on track for results.
              </Typography>

              {options.map(option => (
                <Paper
                  key={option.selectedOptionId}
                  onClick={() => handleSelect(option.selectedOptionId)}
                  sx={{
                    border:
                      selectedOptionId === option.selectedOptionId
                        ? `2px solid ${theme.palette.primary.main}`
                        : `1px solid ${theme.palette.text.primary}`,
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    backgroundColor:
                      selectedOptionId === option.selectedOptionId
                        ? theme.palette.secondary.main
                        : '#FFF',
                  }}
                >
                  <Stack gap={1}>
                    <Typography fontWeight={600}>{option.duration}</Typography>
                    <Typography fontWeight={600}>
                      {isFirstPurchase ? (
                        <Stack direction="row" gap={1} alignItems="center">
                          <Typography
                            sx={{
                              textDecoration: 'line-through',
                            }}
                            color="text.secondary"
                          >
                            $
                            {(
                              option.originalTotalPrice! / option.interval
                            ).toFixed(2)}
                            /mo
                          </Typography>
                          <Typography color="primary">
                            ${option.pricePerMonth.toFixed(2)}
                            /mo
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography>
                          ${option.pricePerMonth.toFixed(2)}
                          /mo
                        </Typography>
                      )}
                    </Typography>
                  </Stack>

                  {option.isRecommended && (
                    <Box
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: '#FFF',
                        borderRadius: '12px',
                        padding: '4px 8px',
                      }}
                    >
                      Recommended
                    </Box>
                  )}
                </Paper>
              ))}

              <Typography fontWeight={600}>Selected Option:</Typography>
              {selectedOption ? (
                <Typography>
                  You selected the{' '}
                  <strong>
                    {selectedOption.interval === 1
                      ? 'monthly'
                      : selectedOption.interval === 3
                      ? 'quarterly'
                      : selectedOption.duration.toLowerCase()}
                  </strong>{' '}
                  plan at{' '}
                  <strong>
                    ${selectedOption.pricePerMonth.toFixed(2)}
                    /month
                  </strong>
                  .
                </Typography>
              ) : (
                <Typography>
                  Please select a subscription option to proceed.
                </Typography>
              )}
            </Stack>
            <Divider sx={{ margin: '16px -24px' }} />
            <Typography color={theme.palette.primary.light}>
              You will only be charged if prescribed
            </Typography>
          </Paper>

          <Paper
            sx={{
              padding: '16px 24px',
              borderRadius: '12px',
              background: '#FFF',
              boxShadow: '0px 4px 10px 0px rgba(0, 0, 0, 0.10)',
              border: '1px solid #D8D8D8',
            }}
          >
            {selectedOption && (
              <>
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontWeight={600}>
                    Total Before Discount
                  </Typography>
                  <Typography fontWeight={600}>
                    ${selectedOption.originalTotalPrice!.toFixed(2)}
                  </Typography>
                </Stack>
                {isFirstPurchase && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontWeight={600}>Discount</Typography>
                    <Typography fontWeight={600} color="green">
                      -$
                      {(
                        selectedOption.originalTotalPrice! -
                        selectedOption.discountedTotalPrice!
                      ).toFixed(2)}
                    </Typography>
                  </Stack>
                )}
                <Divider sx={{ marginY: '8px' }} />
              </>
            )}
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight={600}>Total</Typography>
              <Typography fontWeight={600}>
                {selectedOption
                  ? `$${selectedOption.discountedTotalPrice!.toFixed(2)}`
                  : '$0.00'}
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
              {refillText}
            </Typography>
            <Stack direction="row" justifyContent="space-between" mt={1}>
              <Typography variant="body2" fontWeight={600}>
                Due Now
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                $0.00
              </Typography>
            </Stack>
          </Paper>

          {selectedMedication && (
            <PaymentForm
              medicationQuantityId={
                selectedMedication.medication_quantity_id || 0
              }
              amount={0}
              buttonText="Pay $0 today"
              isFirstPurchase={isFirstPurchase}
            />
          )}
          {showTermsOfUse() && (
            <TermsOfUse
              hasAppointment={false}
              selectedMedication={selectedMedication}
            />
          )}
        </Stack>
      </Grid>
    </Container>
  );
};

export default EDHLCheckout;
