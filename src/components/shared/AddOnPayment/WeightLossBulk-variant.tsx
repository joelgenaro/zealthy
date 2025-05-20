import { ChangeEventHandler, useCallback, useMemo, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import {
  Box,
  Container,
  FormControl,
  FormControlLabel,
  Link,
  Radio,
  Stack,
  RadioGroup,
  Typography,
  Checkbox,
} from '@mui/material';
import { EditDeliveryAddress, UpdatePayment } from '../UpdatePatientInfo';
import { useVisitState } from '@/components/hooks/useVisit';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';
import {
  useAllVisiblePatientSubscription,
  usePatient,
  usePatientAddress,
  usePatientCareTeam,
  usePatientDefaultPayment,
  usePatientPayment,
  usePreIntakePrescriptionRequest,
  useSubscription,
} from '@/components/hooks/data';
import { addMonths, differenceInDays, format, getUnixTime } from 'date-fns';
import PatientPaymentMethod from '../PatientPaymentMethod';
import { usePayment } from '@/components/hooks/usePayment';
import PaymentEditModal from '../PaymentEditModal';
import ErrorMessage from '../ErrorMessage';
import { useSelector } from '@/components/hooks/useSelector';
import toast from 'react-hot-toast';
import SubscriptionRestartModal from '../SubscriptionRestartModal';
import {
  prescriptionRequestedEvent,
  prescriptionRequestedReorderBundleQuarterlyEvent,
  prescriptionRequestedReorderQuarterlyEvent,
} from '@/utils/freshpaint/events';
import {
  useReactivateSubscription,
  useRenewSubscription,
} from '@/components/hooks/mutations';
import Loading from '../Loading/Loading';
import medicationAttributeName from '@/utils/medicationAttributeName';

type PrescriptionRequest =
  Database['public']['Tables']['prescription_request']['Insert'];

interface ConfirmationProps {
  onNext?: () => void;
}

export function WeightLossBulkAddOn({ onNext }: ConfirmationProps) {
  const supabase = useSupabaseClient<Database>();
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [optIn, setOptIn] = useState(false);
  const { data: patientInfo } = usePatient();
  const { createInvoicePayment, renewSubscription, cancelSubscription } =
    usePayment();
  const reactivateSubscription = useReactivateSubscription();
  const renewSub = useRenewSubscription();
  const { data: subscription } = useSubscription(
    'Zealthy 3-Month Weight Loss [IN]'
  );

  const { data: patientAddress, refetch: refetchPatientAddress } =
    usePatientAddress();
  const { data: patientPayment, refetch: refetchPatientPayment } =
    usePatientPayment();
  const { data: patientPrescriptionRequests } =
    usePreIntakePrescriptionRequest();
  const [page, setPage] = useState<string>('confirm');
  const { data: patientCareTeam } = usePatientCareTeam();
  const { medications } = useVisitState();
  const { data: paymentMethod } = usePatientDefaultPayment();
  const [loading, setLoading] = useState<boolean>(false);
  const [shippingId, setShippingId] = useState<string>('1');
  const [openCanceled, setOpenCanceled] = useState(false);
  const [openScheduledForCancelation, setOpenScheduledForCancelation] =
    useState(false);
  const { data: patientSubscriptions, refetch } =
    useAllVisiblePatientSubscription();
  const medicationName = medicationAttributeName(medications?.[0]?.name);

  function compareFn(a: any, b: any) {
    if (new Date(a.created_at) < new Date(b.created_at)) {
      return -1;
    } else if (new Date(a.created_at) > new Date(b.created_at)) {
      return 1;
    }
    return 0;
  }
  const weightLossSubs = patientSubscriptions
    ?.filter(s => s.subscription.name.includes('Weight Loss'))
    .sort(compareFn);
  const weightLossSubscription =
    weightLossSubs?.find(s => s.status === 'active') || weightLossSubs?.[0];

  const bulkCoaching = useSelector(store => store.coaching).find(
    c => c.discounted_price === 264
  );
  const medicareAccess = useSelector(store => store.coaching).find(
    c => c.name === 'Z-Plan by Zealthy Weight Loss Access Program'
  );
  const semaglutideBundled = useSelector(store => store.coaching).find(
    c => c.name === 'Zealthy Weight Loss + Semaglutide Program'
  );
  const tirzepatideBundled = useSelector(store => store.coaching).find(
    c => c.name === 'Zealthy Weight Loss + Tirzepatide Program'
  );
  const texasPromo = useSelector(store => store.coaching).find(
    c => c.name === 'Zealthy Weight Loss (Texas)'
  );

  const handleClose = useCallback(() => setOpen(false), []);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleOptIn: ChangeEventHandler<HTMLInputElement> = e =>
    setOptIn(e.target.checked);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShippingId((event.target as HTMLInputElement).value);
  };

  const subStart = new Date(weightLossSubscription?.created_at || '');

  const subPeriodEnd = new Date(
    weightLossSubscription?.current_period_end || ''
  );

  const daysSinceStart = differenceInDays(new Date(), subStart);
  const daysToPeriodEnd = differenceInDays(subPeriodEnd, new Date());
  const existingBulkSubscription = daysToPeriodEnd > 60;

  const price = useMemo(() => {
    if (existingBulkSubscription) return 0;
    return weightLossSubscription?.status === 'canceled' ||
      (daysToPeriodEnd <= 15 && daysSinceStart >= 75)
      ? 324
      : medicareAccess ||
        weightLossSubscription?.subscription?.name ===
          'Zealthy Weight Loss Access'
      ? 126
      : semaglutideBundled
      ? 446
      : tirzepatideBundled
      ? 718
      : 216;
  }, [
    daysSinceStart,
    daysToPeriodEnd,
    existingBulkSubscription,
    medicareAccess,
    semaglutideBundled,
    tirzepatideBundled,
    weightLossSubscription?.status,
    weightLossSubscription?.subscription?.name,
  ]);

  const months: number = useMemo(() => {
    return weightLossSubscription?.status === 'canceled' ||
      (daysToPeriodEnd <= 15 && daysSinceStart >= 75)
      ? 3
      : 2;
  }, [daysSinceStart, daysToPeriodEnd, weightLossSubscription?.status]);

  const trialEnd = addMonths(
    weightLossSubscription?.status === 'canceled'
      ? new Date()
      : new Date(weightLossSubscription?.current_period_end || ''),
    months
  );

  const isBundled =
    medications?.[0]?.price === 297 ||
    medications?.[0]?.price === 449 ||
    medications?.[0]?.price === 891;

  const onBack = useCallback(() => {
    if (onNext) {
      onNext();
    } else {
      Router.push(Pathnames.PATIENT_PORTAL);
    }
    setLoading(false);
  }, [onNext]);

  const onSuccess = useCallback(async () => {
    setLoading(true);
    if (bulkCoaching) {
      const medicationRequest = {
        patient_id: patientInfo?.id,
        region: patientInfo?.region,
        medication_quantity_id: medications?.[0].medication_quantity_id,
        status: Router.asPath.includes('/patient-portal')
          ? 'REQUESTED'
          : 'PRE_INTAKES',
        note: `${medications?.[0]?.name} compound 3 months. Dosage: ${medications[0].dosage}`,
        specific_medication: medications?.[0]?.name,
        total_price:
          (medications?.[0]?.price ?? 0) + (shippingId === '2' ? 15 : 0),
        shipping_method: parseInt(shippingId, 10),
        care_team: patientCareTeam
          ?.filter((e: any) => e.role.includes('Provider'))
          ?.map((e: any) => e.clinician_id),
      };
      if (Router.asPath.includes('/patient-portal')) {
        const prescriptionRequest = await supabase
          .from('prescription_request')
          .insert(medicationRequest)
          .select()
          .maybeSingle();

        if (
          prescriptionRequest.status === 201 &&
          prescriptionRequest.data?.id
        ) {
          const addToQueue = await supabase
            .from('task_queue')
            .insert({
              task_type: 'PRESCRIPTION_REFILL',
              patient_id: patientInfo?.id,
              queue_type: 'Provider (QA)',
            })
            .select()
            .maybeSingle()
            .then(({ data }) => data);
          await supabase
            .from('prescription_request')
            .update({ queue_id: addToQueue?.id })
            .eq('id', prescriptionRequest.data?.id);

          toast.success(
            'Your prescription request has been successfully submitted!'
          );
          onBack();
        } else {
          setLoading(false);
          toast.error(
            'There was a problem submitting your prescription request'
          );
        }
      } else {
        if (patientInfo?.id) {
          const prescriptionRequest = await supabase
            .from('prescription_request')
            .select(
              'id, patient_id, medication_quantity!inner(medication_dosage!inner(medication!inner(name)))'
            )
            .eq('patient_id', patientInfo?.id)
            .eq(
              'medication_quantity.medication_dosage.medication.name',
              'Weight Loss Medication'
            )
            .is('specific_medication', null)
            .single()
            .then(({ data }) => data);

          if (!prescriptionRequest?.id) {
            return;
          }
          const updatedPrescriptionRequest = await supabase
            .from('prescription_request')
            .upsert(medicationRequest)
            .eq('id', prescriptionRequest?.id)
            .select()
            .maybeSingle();

          if (
            updatedPrescriptionRequest.status === 204 &&
            updatedPrescriptionRequest.data?.id
          ) {
            const addToQueue = await supabase
              .from('task_queue')
              .insert({
                task_type: 'PRESCRIPTION_REFILL',
                patient_id: patientInfo?.id,
                queue_type: 'Provider (QA)',
              })
              .select()
              .maybeSingle()
              .then(({ data }) => data);
            await supabase
              .from('prescription_request')
              .update({ queue_id: addToQueue?.id })
              .eq('id', updatedPrescriptionRequest.data?.id);
            onBack();
          }
        } else {
          setLoading(false);
          toast.error(
            'There was a problem submitting your prescription request'
          );
        }
      }
    } else if (existingBulkSubscription) {
      const price =
        (medications?.[0]?.discounted_price as number) * 3 ||
        medications?.[0]?.price ||
        0;
      const medicationRequest = {
        patient_id: patientInfo?.id,
        region: patientInfo?.region,
        medication_quantity_id: medications?.[0].medication_quantity_id,
        status: 'REQUESTED',
        note: isBundled
          ? `Weight loss - ${medications?.[0]?.name} BUNDLED - 3 months. Dosage: ${medications[0].dosage}`
          : `Weight loss - ${medications?.[0]?.name} NOT BUNDLED - 3 months.  Dosage: ${medications[0].dosage}`,
        specific_medication: medications?.[0]?.name,
        total_price: price + (shippingId === '2' ? 15 : 0),
        shipping_method: parseInt(shippingId, 10),
        care_team: patientCareTeam?.map((e: any) => e.clinician_id),
      };
      const prescriptionRequest = await supabase
        .from('prescription_request')
        .insert(medicationRequest)
        .select()
        .maybeSingle();

      if (prescriptionRequest.status === 201 && prescriptionRequest.data?.id) {
        const addToQueue = await supabase
          .from('task_queue')
          .insert({
            task_type: 'PRESCRIPTION_REFILL',
            patient_id: patientInfo?.id,
            queue_type: 'Provider (QA)',
          })
          .select()
          .maybeSingle()
          .then(({ data }) => data);
        await supabase
          .from('prescription_request')
          .update({ queue_id: addToQueue?.id })
          .eq('id', prescriptionRequest.data?.id);

        prescriptionRequestedEvent(
          patientInfo?.profiles?.email!,
          medicationName!,
          '3-month'
        );
        onBack();
      } else {
        setLoading(false);
        toast.error('There was a problem submitting your prescription request');
      }
    } else {
      await renewSubscription({
        trialEnd: getUnixTime(trialEnd),
        id: subscription?.id!,
        planId: subscription?.reference_id!,
        reference_id: weightLossSubscription?.reference_id!, //this one needs to cancel old one
      });

      //cancel old subscription and hide it
      await cancelSubscription(
        weightLossSubscription?.reference_id!,
        `Upgraded to ${months} months subscription`
      );

      const price =
        (medications?.[0]?.discounted_price as number) * 3 ||
        medications?.[0]?.price ||
        0;
      const medicationRequest: PrescriptionRequest = {
        patient_id: patientInfo?.id,
        region: patientInfo?.region,
        medication_quantity_id: medications?.[0].medication_quantity_id,
        status: Router.asPath.includes('/patient-portal')
          ? 'REQUESTED'
          : 'PRE_INTAKES',
        note: isBundled
          ? `Weight loss - ${medications?.[0]?.name} BUNDLED - 3 months. Dosage: ${medications[0].dosage}`
          : `Weight loss - ${medications?.[0]?.name} NOT BUNDLED - 3 months.  Dosage: ${medications[0].dosage}`,
        specific_medication: medications?.[0]?.name,
        total_price: price + (shippingId === '2' ? 15 : 0),
        shipping_method: parseInt(shippingId, 10),
        care_team: patientCareTeam?.map((e: any) => e.clinician_id),
      };

      const foundPR = patientPrescriptionRequests?.find(
        p =>
          p.medication_quantity_id === medicationRequest.medication_quantity_id
      );
      if (patientPrescriptionRequests?.length && foundPR) {
        medicationRequest.id = foundPR.id;
      }

      const prescriptionRequest = await supabase
        .from('prescription_request')
        .upsert(medicationRequest)
        .select()
        .maybeSingle();

      const addToQueue = await supabase
        .from('task_queue')
        .insert({
          task_type: 'PRESCRIPTION_REQUEST',
          patient_id: patientInfo?.id,
          queue_type: 'Provider (QA)',
        })
        .select()
        .maybeSingle()
        .then(({ data }) => data);
      if (prescriptionRequest?.data?.id) {
        await supabase
          .from('prescription_request')
          .update({ queue_id: addToQueue?.id })
          .eq('id', prescriptionRequest.data?.id);
      }

      if (prescriptionRequest.status === 201) {
        prescriptionRequestedEvent(
          patientInfo?.profiles?.email!,
          medicationName!,
          '3-month'
        );
        if (isBundled) {
          prescriptionRequestedReorderBundleQuarterlyEvent(
            patientInfo?.profiles?.email!,
            medications?.[0]?.name,
            '3 Month',
            medications?.[0]?.dosage!
          );
        } else {
          if (Router.asPath.includes('weight-loss-compound-refill')) {
            prescriptionRequestedReorderQuarterlyEvent(
              patientInfo?.profiles?.email!,
              medications?.[0]?.name,
              '3 Month',
              medications?.[0]?.dosage!
            );
          }
        }
        onBack();
      } else {
        setLoading(false);
        toast.error('There was a problem submitting your prescription request');
      }
    }
  }, [
    bulkCoaching,
    cancelSubscription,
    existingBulkSubscription,
    medications,
    months,
    onBack,
    patientCareTeam,
    patientInfo?.id,
    patientInfo?.profiles?.email,
    patientInfo?.region,
    renewSubscription,
    shippingId,
    subscription?.id,
    subscription?.reference_id,
    supabase,
    weightLossSubscription?.current_period_end,
    weightLossSubscription?.reference_id,
    weightLossSubscription?.status,
  ]);

  const handlePrescriptionRequest = async () => {
    if (!patientInfo || !weightLossSubscription) return;
    setLoading(true);
    if (openScheduledForCancelation) {
      await reactivateSubscription.mutateAsync(
        weightLossSubscription?.reference_id || ''
      );
    }
    if (openCanceled) {
      await renewSub.mutateAsync(weightLossSubscription);
    }

    const metadata = {
      zealthy_medication_name: isBundled
        ? `${medications?.[0]?.name} Bundled.`
        : `${medications?.[0]?.name} compound 3 months.`,
      zealthy_care: 'Weight loss',
      zealthy_subscription_id: weightLossSubscription?.subscription.id,
      reason: `weight-loss-bulk`,
      zealthy_patient_id: patientInfo.id,
    };

    //create payment intent
    if (price > 0) {
      const { data, error } = await createInvoicePayment(
        patientInfo.id,
        price * 100,
        metadata,
        price === 216
          ? '2 Months Weight Loss Membership'
          : price === 446
          ? '2 Months Weight Loss Semaglutide Membership'
          : price === 718
          ? '2 Months Weight Loss Tirzepatide Membership'
          : 'Weight loss bulk'
      );

      //handle payment intent
      if (error) {
        setError(error || 'Something went wrong. Please try again');
        setLoading(false);
        return;
      }

      if (data) {
        return onSuccess();
      }
    } else {
      return onSuccess();
    }
    refetch();
    setLoading(false);
    return;
  };

  const handleSubmit = () => {
    if (!optIn && !semaglutideBundled && !tirzepatideBundled)
      return setError(
        'In order to proceed you will need to select the box above to confirm you have read the terms'
      );
    if (weightLossSubscription?.status === 'canceled') {
      return setOpenCanceled(true);
    }

    if (weightLossSubscription?.status === 'scheduled_for_cancelation') {
      return setOpenScheduledForCancelation(true);
    }

    return handlePrescriptionRequest();
  };

  const handleCanceledClose = () => {
    setOpenCanceled(false);
  };

  const handleScheduledForCancelationClose = () => {
    setOpenScheduledForCancelation(false);
  };

  const handleScheduledForCancelation = async () => {
    await handlePrescriptionRequest();
    refetch();
  };

  const handleCanceled = async () => {
    await handlePrescriptionRequest();
    refetch();
  };

  if (!weightLossSubscription) {
    return <Loading />;
  }

  return (
    <Container maxWidth="xs">
      {page === 'confirm' && (
        <>
          <Typography
            variant="h2"
            sx={{
              marginBottom: '16px',
            }}
          >
            {`Your discount for 3 months of ${medications?.[0]?.name} ${
              !bulkCoaching && !existingBulkSubscription
                ? `and the next ${months} months of your membership has been applied.`
                : 'has been applied.'
            }  You won’t be charged for medication unless your provider approves your Rx request.`}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '24px',
              background: '#FFFFFF',
              border: '1px solid #D8D8D8',
              borderRadius: '16px',
              marginBottom: '1rem',
            }}
          >
            {!bulkCoaching && !existingBulkSubscription && (
              <Box sx={{ marginBottom: '16px' }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: '16px !important',
                    fontWeight: '600',
                    lineHeight: '24px !important',
                    color: '#989898',
                  }}
                >
                  {`Pre-pay next ${months} months of membership`}
                </Typography>
                <Typography variant="body1">
                  <Typography
                    component="span"
                    variant="body1"
                    sx={{
                      textDecoration: 'line-through',
                      marginRight: '0.2rem',
                      width: '20px',
                    }}
                  >
                    $
                    {medicareAccess
                      ? medicareAccess?.price
                      : texasPromo
                      ? texasPromo?.price
                      : semaglutideBundled
                      ? '297'
                      : tirzepatideBundled
                      ? '449'
                      : '135'}
                    /month
                  </Typography>
                  {medicareAccess
                    ? '$63 per month'
                    : semaglutideBundled
                    ? '$223 per month'
                    : tirzepatideBundled
                    ? `$359 per month`
                    : `$108 per month`}
                </Typography>
                <Typography variant="body1">
                  {`Next ${months} months upfront with discount applied and you will lock in 20% ongoing discounts by updating your membership to quarterly`}
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {`$${price} Due Today`}
                </Typography>
              </Box>
            )}
            <Box sx={{ marginBottom: '16px' }}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: '16px !important',
                  fontWeight: '600',
                  lineHeight: '24px !important',
                  color: '#989898',
                }}
              >
                {'Your medication'}
              </Typography>
              <Typography variant="subtitle1">
                {`${medications?.[0]?.name}`}
              </Typography>
              <Typography variant="subtitle1">
                {medications?.[0]?.dosage?.replace('mgs', 'mg')}
              </Typography>
              <Typography variant="subtitle1" sx={{ marginBottom: '2px' }}>
                {`3 month supply`}
              </Typography>
              {semaglutideBundled || tirzepatideBundled ? null : (
                <>
                  <Typography variant="subtitle1" sx={{ marginBottom: '2px' }}>
                    <Typography
                      component="span"
                      variant="body1"
                      sx={{
                        textDecoration: 'line-through',
                        marginRight: '0.2rem',
                        width: '20px',
                      }}
                    >
                      {`$${medications?.[0]?.price}`}
                    </Typography>
                    {`$${Math.floor(
                      medications?.[0]?.discounted_price ?? 0
                    )}/month`}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    fontWeight="600"
                    sx={{ marginBottom: '2px' }}
                  >
                    {`$${Math.floor(
                      (medications?.[0]?.discounted_price ?? 0) * 3
                    )} due if prescribed*`}
                  </Typography>
                </>
              )}
            </Box>
            <Box sx={{ marginBottom: '16px' }}>
              <Typography
                component="h4"
                variant="body1"
                sx={{ color: '#989898', marginBottom: '16px' }}
              >
                Delivery options
              </Typography>
              <FormControl>
                <RadioGroup
                  aria-labelledby="delivery-options"
                  defaultValue="standard"
                  name="radio-buttons-group"
                  value={shippingId}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="1"
                    control={<Radio />}
                    sx={{ marginBottom: '10px' }}
                    label={
                      <>
                        <Typography
                          sx={{
                            fontWeight: '600',
                            fontSize: '14px !important',
                            lineHeight: '20px',
                            letterSpacing: '-0.006em',
                            color: '#1B1B1B',
                          }}
                        >
                          UPS Mail Innovations - $0
                        </Typography>
                        <Typography>Usually arrives in 5-8 days</Typography>
                      </>
                    }
                  />
                  <FormControlLabel
                    value="2"
                    control={<Radio />}
                    sx={{ marginBottom: '16px' }}
                    label={
                      <>
                        <Typography
                          sx={{
                            fontWeight: '600',
                            fontSize: '14px !important',
                            lineHeight: '20px',
                            letterSpacing: '-0.006em',
                            color: '#1B1B1B',
                          }}
                        >
                          UPS Next Day Air Saver - $15
                        </Typography>
                        <Typography>Usually arrives in 3-5 days</Typography>
                      </>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </Box>
            <Box sx={{ marginBottom: '16px' }}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: '16px !important',
                  fontWeight: '600',
                  lineHeight: '24px !important',
                  color: '#989898',
                }}
              >
                {'Delivery address'}
              </Typography>
              <Typography>{patientAddress?.address_line_1}</Typography>
              <Typography>{patientAddress?.address_line_2}</Typography>
              <Typography>
                {patientAddress?.city}, {patientAddress?.state}
              </Typography>
              <Typography>{patientAddress?.zip_code}</Typography>
              <Typography sx={{ marginBottom: '16px' }}>
                United States
              </Typography>
              <Link
                onClick={() => setPage('delivery-address')}
                sx={{
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                {'Edit'}
              </Link>
            </Box>
            {paymentMethod ? (
              <>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: '16px !important',
                    fontWeight: '600',
                    lineHeight: '24px !important',
                    color: '#989898',
                  }}
                >
                  {'Payment'}
                </Typography>
                <Stack gap="16px">
                  <PatientPaymentMethod paymentMethod={paymentMethod} />
                  <Link
                    onClick={handleOpen}
                    sx={{
                      fontWeight: '600',
                      fontSize: '16px',
                      cursor: 'pointer',
                    }}
                  >
                    {'Edit'}
                  </Link>
                </Stack>
              </>
            ) : null}
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            {!semaglutideBundled && !tirzepatideBundled ? (
              <Box
                sx={{
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  textAlign: 'start',
                  marginBottom: '1rem',
                }}
              >
                <FormControlLabel
                  sx={{
                    margin: '0',
                    marginTop: '20px',
                    alignItems: 'flex-start',
                    '& .MuiFormControlLabel-label': {
                      letterSpacing: '-0.006em',
                      lineHeight: '1.25rem',
                    },
                  }}
                  control={
                    <Checkbox
                      size="small"
                      checked={optIn}
                      onChange={handleOptIn}
                      sx={{
                        padding: 0,
                        color: '#1B1B1B',
                        marginRight: '16px',
                      }}
                    />
                  }
                  label="By proceeding, you confirm you’re aware that Compound GLP-1 is not included in the price of the membership."
                />
              </Box>
            ) : null}
            {error ? <ErrorMessage>{error}</ErrorMessage> : null}
            <LoadingButton
              sx={{ width: '100%', marginBottom: '0.5rem' }}
              loading={loading}
              disabled={loading}
              onClick={handleSubmit}
            >
              {`Confirm order - ${
                !bulkCoaching && !existingBulkSubscription
                  ? `$${price}.00`
                  : '$0 due today'
              }`}
            </LoadingButton>
            {semaglutideBundled || tirzepatideBundled ? (
              <Typography
                variant="subtitle2"
                fontSize="0.75rem !important"
                sx={{
                  fontStyle: 'italic',
                  marginTop: '0.5rem',
                }}
              >
                {
                  '*This is what Zealthy expects to last 3 months. If you are determined not to be eligible by your provider, you will be able to get a refund.'
                }
              </Typography>
            ) : (
              <Stack gap="0.5rem">
                <Typography
                  variant="subtitle2"
                  fontSize="0.75rem !important"
                  sx={{ fontStyle: 'italic' }}
                >{`*You will be charged $${Math.floor(
                  (medications?.[0]?.discounted_price ?? 0) * 3
                )} if you are prescribed compounded ${
                  medications?.[0]?.name
                }.`}</Typography>
                <Typography
                  variant="subtitle2"
                  fontSize="0.75rem !important"
                  sx={{ fontStyle: 'italic' }}
                >
                  {
                    'This is what Zealthy expects to last 3 months. Your provider may recommend a different dosage amount, which would change the price.'
                  }
                </Typography>
                <Typography
                  variant="subtitle2"
                  fontSize="0.75rem !important"
                  sx={{ fontStyle: 'italic' }}
                >
                  {`By updating your membership to quarterly, you will save 20% every quarter on your membership at $108/month. Your next charge of $324 will occur on ${format(
                    trialEnd,
                    'MMMM d, yyyy'
                  )}.`}
                </Typography>
              </Stack>
            )}
          </Box>
          <PaymentEditModal
            onClose={handleClose}
            open={open}
            title="Update your card to get your care or prescription"
          />
          <SubscriptionRestartModal
            titleOnSuccess={'Your subscription has been reactivated.'}
            onConfirm={handleCanceled}
            onClose={handleCanceledClose}
            title={
              Router.asPath.includes('/bundled')
                ? `Reactivate your weight loss + ${
                    medications?.[0]?.name?.split(' ')[0]
                  } membership to order medication?`
                : 'Reactivate your weight loss membership to order medication?'
            }
            description={[
              'In order to order medication, you need to have an active Weight Loss membership, which covers your provider developing your treatment plan and ensuring you are receiving high-quality care.',
              'Once you confirm below, your Zealthy Weight Loss subscription will become active again. This will enable you to receive care including GLP-1 medication if appropriate for weight loss, get continued access to our coordination team to help make medications more affordable, and begin working with your coach again.',
            ]}
            medication={medications[0]}
            open={openCanceled}
            buttonText="Yes, reactivate and order"
          />
          <SubscriptionRestartModal
            titleOnSuccess={'Your subscription has been reactivated.'}
            open={openScheduledForCancelation}
            title={
              Router.asPath.includes('/bundled')
                ? `Reactivate your weight loss + ${
                    medications?.[0]?.name?.split(' ')[0]
                  } membership to order medication?`
                : 'Reactivate your weight loss membership to order medication?'
            }
            description={[
              'In order to order medication, you need to have an active Weight Loss membership that is not scheduled for cancellation within the next month, since this will allow your provider to monitor your care during the entire period of taking your medication.',
              'Once you confirm below, your Zealthy Weight Loss subscription will no longer be scheduled for cancellation. This will enable you to receive care including GLP-1 medication if appropriate for weight loss, get continued access to our coordination team to help make medications more affordable, and begin working with your coach again.',
            ]}
            medication={medications[0]}
            onConfirm={handleScheduledForCancelation}
            onClose={handleScheduledForCancelationClose}
            buttonText="Yes, reactivate and order"
          />
        </>
      )}
      {page === 'delivery-address' && (
        <>
          <EditDeliveryAddress goHome={() => setPage('confirm')} />
        </>
      )}
      {page === 'update-payment' && (
        <>
          <UpdatePayment
            stripeCustomerId={patientPayment?.customer_id}
            patientId={patientInfo?.id}
            goHome={() => {
              refetchPatientPayment();
              setPage('confirm');
            }}
          />
        </>
      )}
    </Container>
  );
}
