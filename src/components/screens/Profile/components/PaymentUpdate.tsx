import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import {
  PatientProps,
  usePatientPayment,
  usePatientUnpaidInvoices,
  useCompoundMatrixDurationByPrice,
  useVWOVariationName,
  usePatientCompoundOrders,
} from '@/components/hooks/data';
import { useUpdateDefaultPaymentMethod } from '@/components/hooks/mutations';
import { usePayment } from '@/components/hooks/usePayment';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import ErrorMessage from '@/components/shared/ErrorMessage';
import CheckMarkCircleGreen from '@/components/shared/icons/CheckMarkCircleGreen';
import WhiteBox from '@/components/shared/layout/WhiteBox';
import {
  Box,
  Button,
  Link,
  Stack,
  Typography,
  Divider,
  Container,
} from '@mui/material';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { ConfirmCardSetupData, loadStripe } from '@stripe/stripe-js';
import { useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import BottlePhone from '@/components/screens/Checkout/CheckoutV2/asset/BottlePhone';
import Router, { useRouter } from 'next/router';
import { Invoice, OrderPrescriptionProps } from '../../../hooks/data';
import { useIntakeState } from '@/components/hooks/useIntake';
import { useSearchParams } from 'next/navigation';
import { supabaseClient } from '@/lib/supabaseClient';
import { useVWO } from '@/context/VWOContext';

interface PaymentProps {
  onCancel: () => void;
  patient?: PatientProps;
}

function PaymentUpdate({ patient, onCancel }: PaymentProps) {
  const supabase = useSupabaseClient<Database>();
  const [page, setPage] = useState('edit-payment');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const updatePaymentMethod = useUpdateDefaultPaymentMethod();
  const { data: paymentProfile } = usePatientPayment();
  const { createSetupIntent, createPaymentIntent } = usePayment();
  const elements = useElements();
  const stripe = useStripe();
  const { data: unpaidInvoices = [] } = usePatientUnpaidInvoices();
  const [timePeriod, setTimePeriod] = useState<number[]>([]);
  const [klarnaLoading, setKlarnaLoading] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: variation8912, status: status8912 } =
    useVWOVariationName('8912');
  const isVariation8912 = variation8912?.variation_name === 'Variation-1';
  const { data: orders } = usePatientCompoundOrders();
  const pi = searchParams?.get('payment_id');
  const [uncapturedPaymentIntentId, setUncapturedPaymentIntentId] =
    useState<string>('');
  const [klarnaCancelled, setKlarnaCancelled] = useState<boolean>(false);
  const vwo = useVWO();

  useEffect(() => {
    if (pi) {
      setUncapturedPaymentIntentId(pi);
    }
  }, [pi]);

  const activateVariant = async () => {
    if (vwo && patient && unpaidInvoices?.length) {
      await vwo.activate('8912', patient!);
    }
  };

  useEffect(() => {
    activateVariant();
  }, [patient, vwo, unpaidInvoices]);

  useEffect(() => {
    if (router.query['payment_id']) {
      setLoading(true);
    }
    const getPiInfo = async () => {
      const data = await stripe?.retrievePaymentIntent(
        router.query['payment_intent_client_secret'] as string
      );

      const klarnaErrors = [
        'Customer cancelled checkout on Klarna',
        'Customer was declined by Klarna',
        'Klarna checkout was not completed and has expired',
      ];

      // Check if Klarna Payment was cancelled
      const cancelledKlarnaPayment = klarnaErrors.includes(
        data?.paymentIntent?.last_payment_error?.message || ''
      );

      if (cancelledKlarnaPayment) {
        setKlarnaCancelled(true);
        setLoading(false);
        return;
      } else if (patient && uncapturedPaymentIntentId) {
        setKlarnaCancelled(false);
        processKlarnaSuccess();
      }
    };
    getPiInfo();
  }, [
    router.query,
    stripe,
    supabaseClient,
    router,
    uncapturedPaymentIntentId,
    patient,
    timePeriod,
  ]);

  const findOrderWithClosestCreatedAt = (
    invoice: Invoice,
    orders?: OrderPrescriptionProps[]
  ): OrderPrescriptionProps | null => {
    if (!orders?.length) {
      return null;
    }

    const invoiceTimestamp = new Date(invoice.created_at).getTime();

    return (orders || [])?.reduce((closest: any, current: any) => {
      const closestTimestamp = new Date(
        closest?.created_at ?? new Date()
      ).getTime();
      const currentTimestamp = new Date(
        current?.created_at ?? new Date()
      ).getTime();

      const closestDiff = Math.abs(closestTimestamp - invoiceTimestamp);
      const currentDiff = Math.abs(currentTimestamp - invoiceTimestamp);

      return currentDiff < closestDiff ? current : closest;
    }, (orders || [])?.[0]);
  };

  useEffect(() => {
    if (unpaidInvoices?.length && orders?.length && orders !== undefined) {
      const durations = unpaidInvoices.map(invoice =>
        findOrderWithClosestCreatedAt(invoice, orders)
      );

      // Create an async function inside useEffect
      const fetchData = async () => {
        try {
          const getOrderDurations = async (durations: any, supabase: any) => {
            try {
              // Map through each order and get the corresponding prescription_request
              const ordersWithDurations = await Promise.all(
                durations.map(async (order: any) => {
                  // Skip if there's no prescription request ID
                  if (!order.prescription_request_id) {
                    return null;
                  }

                  // Query the prescription_request table for the matching ID
                  const { data, error } = await supabase
                    .from('prescription_request')
                    .select('number_of_month_requested')
                    .eq('id', order.prescription_request_id)
                    .single();

                  if (error) {
                    console.error(
                      'Error fetching prescription request:',
                      error
                    );
                    return null;
                  }

                  // Return just the number value
                  return data ? Number(data.number_of_month_requested) : null;
                })
              );

              // Filter out any null values
              return ordersWithDurations.filter(value => value !== null);
            } catch (error) {
              console.error('Error processing orders:', error);
              return []; // Return empty array if there's an error
            }
          };

          const durationList = await getOrderDurations(durations, supabase);

          // Set the time period with the array of numbers
          setTimePeriod(durationList);
        } catch (error) {
          console.error('Error:', error);
        }
      };

      // Call the async function
      fetchData();
    }
  }, [unpaidInvoices, orders]);

  const handlePayAllInvoices = async () => {
    await axios.post(`/api/stripe/utils/authorization/issued`, {
      unpaidInvoices: unpaidInvoices,
      stripeCustomerId: paymentProfile?.customer_id,
    });
  };
  console.log(timePeriod, 'time');
  const voidInvoices = async (paymentIntentId: string) => {
    try {
      await axios.post('/api/service/payment/void-invoices', {
        patientId: patient?.id,
      });

      console.log('Successfully voided invoices');

      for (const invoice of unpaidInvoices) {
        await supabase
          .from('invoice')
          .update({ uncaptured_payment_intent_id: paymentIntentId })
          .eq('reference_id', invoice.reference_id);
      }
    } catch (error) {
      console.error('Error voiding invoices:', error);
    }
  };

  const trackPaymentSuccess = async () => {
    // Only proceed if we have the necessary dependencies
    if (!vwo || !patient || !timePeriod?.length) {
      return;
    }

    // Map time periods to their respective tracking event names
    const getTrackingEventName = (
      months: number | null | undefined
    ): string | null => {
      if (months === null || months === undefined) {
        return null;
      }

      switch (months) {
        case 1:
          return '1MonthGlp1MedicationPaidFor';
        case 3:
          return '3MonthCompoundGlp-1PaidFor';
        case 6:
          return '6MonthGlp1PaidFor';
        case 12:
          return '12MonthGlp1PaidFor';
        default:
          return null;
      }
    };

    // Create an array of tracking promises with proper type safety
    const trackingPromises: Array<() => Promise<any>> = [];

    // Populate the array with valid tracking functions
    timePeriod.forEach(months => {
      const eventName = getTrackingEventName(months);
      if (eventName) {
        trackingPromises.push(() => vwo!.track('8912', eventName, patient!));
      }
    });

    // Execute all tracking calls in parallel
    if (trackingPromises.length > 0) {
      try {
        await Promise.allSettled(trackingPromises.map(trackFn => trackFn()));
        console.log(
          `Successfully tracked ${trackingPromises.length} VWO events`
        );
      } catch (error) {
        console.error('Error tracking VWO events:', error);
      }
    }
  };

  const processKlarnaSuccess = async () => {
    if (!uncapturedPaymentIntentId || !patient?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Void the invoices and update with payment intent ID
      await voidInvoices(uncapturedPaymentIntentId);

      // Update payment profile
      const { error: updateError } = await supabase
        .from('payment_profile')
        .update({ updated_at: new Date().toISOString() })
        .eq('patient_id', patient?.id);

      if (updateError) {
        console.error('Error updating payment_profile:', updateError);
        setError('Failed to update payment profile.');
        setLoading(false);
        return;
      }

      await trackPaymentSuccess();

      setPage('success');
      setLoading(false);
    } catch (e: any) {
      setError(e.response?.data?.message || 'An error occurred');
      setLoading(false);
    }
  };

  const unpaidInvoice = unpaidInvoices.length > 0;
  const unpaidInvoiceTotal = unpaidInvoices.reduce((sum, currentInvoice) => {
    return sum + (currentInvoice.amount_due || 0);
  }, 0);

  const onSuccess = useCallback(
    async (paymentMethodId: string) => {
      setLoading(true);
      try {
        await updatePaymentMethod.mutateAsync({
          paymentMethodId: paymentMethodId,
        });

        if (patient?.id) {
          if (unpaidInvoice) {
            await handlePayAllInvoices().catch(error => {
              console.error('Error paying all invoices:', error);
              setError('Failed to pay all invoices.');
            });
          }
          const { error: updateError } = await supabase
            .from('payment_profile')
            .update({ updated_at: new Date().toISOString() })
            .eq('patient_id', patient?.id);

          if (updateError) {
            console.error('Error updating payment_profile:', updateError);
            setError('Failed to update payment profile.');
            setLoading(false);
            return;
          }
        }

        await trackPaymentSuccess();

        setLoading(false);
        setPage('success');
      } catch (e: any) {
        setError(e.response?.data?.message || 'An error occurred');
        setLoading(false);
      }
    },
    [patient, updatePaymentMethod, supabase]
  );

  const handleKlarnaPayment = async () => {
    setKlarnaLoading(true);
    try {
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
      );

      const totalAmountDue = unpaidInvoices?.reduce((total, invoice) => {
        return total + (invoice.amount_due || 0);
      }, 0);

      if (!totalAmountDue) {
        setError('No payment amount due');
        setKlarnaLoading(false);
        return;
      }

      const invoiceIds = unpaidInvoices
        ?.map(invoice => invoice.reference_id)
        .join(',');
      const invoiceDescriptions = unpaidInvoices
        ?.map(invoice => invoice.description)
        .join(', ');

      const metadata = {
        zealthy_medication_name: invoiceDescriptions,
        zealthy_care: unpaidInvoices?.[0]?.care,
        zealthy_patient_email: patient?.profiles?.email,
        zealthy_subscription_id: unpaidInvoices?.[0]?.subscription,
        reason: `Update Payment`,
        zealthy_patient_id: patient?.id,
        zealthy_product_name: unpaidInvoices?.[0]?.product,
        zealthy_invoice_ids: invoiceIds,
      };

      const { data, error } = await createPaymentIntent(
        patient?.id!,
        totalAmountDue * 100, // Convert to cents
        metadata,
        navigator.userAgent,
        true,
        false
      );

      if (error || !data) {
        console.error('Error creating payment intent:', error);
        setError('Failed to create payment intent');
        setKlarnaLoading(false);
        return;
      }

      const { client_secret, intent_id } = data;

      if (!client_secret) {
        setError('Client secret not found');
        setKlarnaLoading(false);
        return;
      }

      const redirect = router.asPath.replaceAll('&', '~');

      const klarnaResult = await stripe?.confirmKlarnaPayment(client_secret, {
        return_url: `${window.location.origin}/patient-portal/profile/update-payment?payment_id=${intent_id}&redirect-if-failed=${redirect}`,
      });

      if (klarnaResult?.error) {
        console.error('Payment failed:', klarnaResult.error);
        setError(
          `Payment failed: ${klarnaResult.error.message || 'Please try again.'}`
        );
        setKlarnaLoading(false);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error in handleKlarnaPayment:', error);
      setKlarnaLoading(false);
    }
  };

  const handleSetupIntent = useCallback(
    async (
      clientSecret: string,
      payment_method: ConfirmCardSetupData['payment_method']
    ) => {
      const result = await stripe!.confirmCardSetup(clientSecret, {
        payment_method,
      });

      if (result.error) {
        setError(
          result.error.message || 'Something went wrong, Please try again'
        );
        setLoading(false);
        return;
      }

      // The payment has been processed!
      if (result.setupIntent.status === 'succeeded') {
        await onSuccess(result.setupIntent.id);
      }

      return;
    },
    [onSuccess, stripe]
  );

  const handleConfirmation = useCallback(async () => {
    if (!stripe || !elements || !patient) return;
    setError('');

    setLoading(true);

    const result = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement)!,
    });

    console.log('card result', result);

    if (result.error) {
      setError(
        result.error.message || 'Something went wrong. Please try again'
      );
      setLoading(false);
      return;
    }

    const { data, error } = await createSetupIntent(patient.id);

    if (error) {
      setError(error?.message || 'Something went wrong. Please try again');
      setLoading(false);
      return;
    }

    await handleSetupIntent(data!.client_secret, result.paymentMethod.id);

    setLoading(false);
  }, [stripe, elements, patient, handleSetupIntent]);

  const descriptions = unpaidInvoices?.map((invoice: any) =>
    (invoice?.description || '').toLowerCase()
  );
  const isMembership =
    descriptions?.some(
      (desc: string) =>
        desc.toLowerCase()?.includes('zealthy') &&
        desc.toLowerCase()?.includes('weight loss')
    ) &&
    !descriptions?.some((desc: string) => desc.includes('semaglutide')) &&
    !descriptions?.some((desc: string) => desc.includes('tirzepatide'));
  const paymentText = isMembership
    ? 'The payment information on file for your account failed. Update your payment information or pay later with Klarna to continue your weight loss treatment at Zealthy, which is required to receive GLP-1 medication from Zealthy.'
    : 'The payment information on file for your account failed. Update your payment information or pay later with Klarna to receive your medication. You must update your payment info below to receive your order, which will be sent to the address listed on your account once payment is received.';

  const fromCharge = ((unpaidInvoiceTotal * 1.0999) / 24).toFixed(2);
  const toCharge = ((unpaidInvoiceTotal * 1.29999) / 3).toFixed(2);

  const klarnaText = isMembership
    ? `This is the cost of the Zealthy Weight Loss membership. If you choose to pay with Klarna, you can split this purchase into equal installments ranging from $${fromCharge} - $${toCharge} typically paid monthly, which you will pay across equal installments every 30 days or every 2 weeks until you have paid the the balance in full. This includes the total cost of 1 month of membership. Membership renews automatically each month. The cost of medication is separate.`
    : `This is what Zealthy expects to last ${timePeriod[0]} month${
        timePeriod[0] > 1 ? 's' : ''
      }. Your provider has already written your prescription, so once you pay this will be shipped to your home. If you choose to pay with Klarna, you can split this purchase into equal installments ranging from $${fromCharge} - $${toCharge} typically paid monthly, which you will pay across equal installments every 30 days or every 2 weeks until you have paid the the balance in full. This includes the total cost of the ${
        timePeriod[0]
      } month supply of medication`;

  return (
    <Container maxWidth={isVariation8912 && unpaidInvoice ? 'sm' : 'xs'}>
      <Stack direction="column">
        {page === 'success' ? null : unpaidInvoice && isVariation8912 ? (
          <Stack gap="5px" marginBottom="1rem" textAlign="left">
            <Typography variant="h2">Lose Weight now, pay later</Typography>
            <Typography sx={{ fontWeight: 'bold' }}>
              Pay later with Klarna
            </Typography>
          </Stack>
        ) : (
          <Stack gap="5px" marginBottom="2rem" textAlign="left">
            <Typography
              variant="h3"
              sx={{
                fontSize: '18px !important',
                fontWeight: '600',
                lineHeight: '26px !important',
              }}
            >
              {unpaidInvoice
                ? 'To continue to get medication or care, you must update your payment information.'
                : 'Update payment method'}
            </Typography>
            <Typography variant="h4">
              {unpaidInvoice
                ? 'Your payment is past due because we have been unable to charge your payment method on file. To receive additional medication or care, including GLP-1 medication, you must add a successful payment method.'
                : 'Add new payment method to get your care or prescription.'}
            </Typography>
          </Stack>
        )}
        {page === 'success' ? null : page === 'edit-payment' &&
          isVariation8912 &&
          unpaidInvoice ? (
          <Stack gap={'.5rem'}>
            {error ? <ErrorMessage>{error}</ErrorMessage> : null}
            <WhiteBox padding="1.5rem">
              <Typography>{paymentText}</Typography>
              <Divider style={{ width: 'auto' }} />
              {unpaidInvoices.map((invoice, i) => (
                <Stack
                  key={invoice.reference_id || i}
                  direction="row"
                  sx={{ justifyContent: 'space-between' }}
                >
                  <Stack direction="column" sx={{ flex: 1 }}>
                    {(invoice?.description || '')
                      .toLowerCase()
                      .includes('semaglutide') ? (
                      <Stack sx={{ alignItems: 'center' }}>
                        <Image
                          src={`https://gcqrvlegvyiunwewkuoz.supabase.co/storage/v1/object/public/images/programs/semaglutide.png`}
                          height={100}
                          width={50}
                          alt="Product Image"
                        />{' '}
                      </Stack>
                    ) : (invoice?.description || '')
                        .toLowerCase()
                        .includes('tirzepatide') ? (
                      <Stack sx={{ alignItems: 'center' }}>
                        <Image
                          src={`https://gcqrvlegvyiunwewkuoz.supabase.co/storage/v1/object/public/images/programs/tirzepatide.png`}
                          height={100}
                          width={50}
                          alt="Product Image"
                        />
                      </Stack>
                    ) : isMembership ? (
                      <BottlePhone />
                    ) : null}
                  </Stack>
                  <Stack
                    direction="column"
                    sx={{
                      flex: 1,
                      justifyContent: 'space-between',
                      textAlign: 'left',
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: '600',
                        fontSize: '16px',
                      }}
                    >
                      {invoice?.product}
                    </Typography>
                    <Typography>{invoice?.description}</Typography>
                    {!isMembership ? (
                      <Typography>
                        {timePeriod[i]} month
                        {timePeriod[i] > 1 ? 's' : ''}
                      </Typography>
                    ) : (
                      <Typography />
                    )}{' '}
                  </Stack>
                  <Stack
                    direction="column"
                    sx={{
                      flex: 1,
                      textAlign: 'left',
                      paddingRight: '5px',
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: '600',
                        fontSize: '16px',
                      }}
                    >
                      ${invoice?.amount_due}
                    </Typography>
                  </Stack>
                </Stack>
              ))}
            </WhiteBox>
            <Typography
              variant="h3"
              sx={{
                fontSize: '15px !important',
                fontWeight: '600',
                lineHeight: '26px !important',
              }}
            >
              Update Payment Information or Pay Later with Klarna
            </Typography>
            <WhiteBox padding="24px">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      '::placeholder': {
                        color: '#1B1B1B',
                      },
                    },
                  },
                }}
              />
            </WhiteBox>
            <LoadingButton
              variant="outlined"
              sx={{
                color: 'black',
                borderColor: 'lightgray',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                '&:hover': {
                  borderColor: 'gray',
                },
              }}
              onClick={() => {
                handleKlarnaPayment();
              }}
              loading={klarnaLoading}
              disabled={klarnaLoading}
            >
              Continue with
              <Box
                component="img"
                src="/images/free-consult/klarna-badge.png"
                alt="Klarna"
                sx={{
                  height: 50,
                  ml: -1,
                }}
              />
            </LoadingButton>
            <Stack gap="1rem">
              <LoadingButton
                loading={loading}
                disabled={loading}
                fullWidth
                onClick={handleConfirmation}
                sx={{
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                {unpaidInvoice ? 'Complete Order' : 'Submit'}
              </LoadingButton>
            </Stack>
            <Typography
              textAlign="center"
              color="#1B1B1B"
              variant="h4"
              padding="0 5px"
              sx={{
                fontSize: '0.8rem!important',
                lineHeight: '0.9rem!important',
              }}
            >
              {klarnaText}
            </Typography>
          </Stack>
        ) : (
          <Stack gap="2rem">
            <WhiteBox padding="24px">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      '::placeholder': {
                        color: '#1B1B1B',
                      },
                    },
                  },
                }}
              />
            </WhiteBox>
            {error ? <ErrorMessage>{error}</ErrorMessage> : null}
            {page !== 'success' && (
              <Stack gap="1rem">
                <LoadingButton
                  loading={loading}
                  disabled={loading}
                  fullWidth
                  onClick={handleConfirmation}
                  sx={{
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                  }}
                >
                  Submit
                </LoadingButton>
                <Button
                  fullWidth
                  color="grey"
                  sx={{
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                  }}
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              </Stack>
            )}
          </Stack>
        )}
        {page === 'success' && (
          <>
            <Box
              sx={{
                textAlign: 'center',
                padding: '24px',
                background: '#FFFFFF',
                border: '1px solid #D8D8D8',
                borderRadius: '16px',
              }}
            >
              <Box sx={{ marginBottom: '14px' }}>
                <CheckMarkCircleGreen />
              </Box>
              <Typography
                component="h2"
                variant="h2"
                sx={{ marginBottom: '32px' }}
              >
                {uncapturedPaymentIntentId && !klarnaCancelled
                  ? 'Successfully paid with Klarna!'
                  : 'Successfully updated your payment information!'}
              </Typography>
              <Link
                sx={{
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
                onClick={onCancel}
              >
                Go back home
              </Link>
            </Box>
          </>
        )}
      </Stack>
    </Container>
  );
}

export default PaymentUpdate;
