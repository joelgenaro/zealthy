import Router from 'next/router';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Typography,
  Link,
} from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { Pathnames } from '@/types/pathnames';
import { SubProps } from '../SubscriptionContent';
import SubscriptionRestartModal from '@/components/shared/SubscriptionRestartModal';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useReactivateSubscription } from '@/components/hooks/mutations';
import { usePayment } from '@/components/hooks/usePayment';
import { PrescriptionRequestProps } from '@/components/hooks/data';
import { MedicationSubscriptionRequestParams } from '@/types/api/create-medication-subscription';
import { daysFromNow } from '@/utils/date-fns';
import { formattedPharmacy } from '@/utils/parsePrescriptionPharmacy';
import { useQueryClient } from 'react-query';
import { uuid } from 'uuidv4';
import { format, isSameYear } from 'date-fns';
import ExpeditedShipping, { ExtendedSubscription } from './ExpeditedShipping';

type Address = Database['public']['Tables']['address']['Row'];
type Subscription = Database['public']['Tables']['subscription']['Row'];
type PatientSubscription =
  Database['public']['Tables']['patient_subscription']['Row'] & {
    subscription: Subscription;
  };

const statusMap: { [key: string]: string } = {
  ended: 'Prescription expired. Renew prescription today',
  requested_renewal: 'Prescription request sent to medical team for review.',
  incomplete: 'Payment failed. Update payment method',
  incomplete_expired: 'Canceled',
  scheduled_for_cancelation: 'Scheduled for cancellation',
  canceled: 'Canceled',
};

const buttonMap: { [key: string]: string } = {
  ended: 'Renew prescription today',
  requested_renewal: 'Prescription requested.',
  incomplete: 'Payment failed.',
  incomplete_expired: 'Prescription Canceled',
  canceled: 'Canceled',
};

const toMonth = (
  interval: string | null | undefined,
  intervalCount: number | null | undefined
) => {
  if (!intervalCount || !interval) return 0;
  switch (interval) {
    case 'day':
      return intervalCount / 30;
    case 'month':
      return intervalCount;
    default:
      return 0;
  }
};

const formatFirstWord = (text: string): string => {
  if (!text) return '';
  const firstWord = text.split(' ')[0];
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
};

interface Props {
  sub: SubProps;
  refetch: () => Promise<void>;
  patientAddress: Address | null;
  patientPayment: string;
  setRefillNow: (value: boolean) => void;
  setSelectedSubscription: (value: SubProps) => void;
  setPage: (value: string) => void;
  isDetails?: boolean;
}

const SubscriptionCard = ({
  sub,
  patientAddress,
  patientPayment,
  setRefillNow,
  setSelectedSubscription,
  setPage,
  refetch,
  isDetails = false,
}: Props) => {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient<Database>();
  const [modalOpen, setModalOpen] = useState(false);
  const [openRenew, setOpenRenew] = useState(false);
  const { createInvoicePayment, createMedicationSubscription } = usePayment();
  const [isOutstandingRequest, setIsOutstandingRequest] = useState(false);
  const [hasExistingMedRequest, setHasExistingMedRequest] = useState(false);
  const [getSoonerModalOpen, setGetSoonerModalOpen] = useState(false);

  const reactivateSubscription = useReactivateSubscription();
  const [failed, setFailed] = useState(false);
  const [careSubscription, setCareSubscription] =
    useState<PatientSubscription | null>(null);
  const uniqueKey = useMemo(() => uuid(), [failed]);

  const isCanceledStatus = useMemo(
    () =>
      sub?.status && ['canceled', 'incomplete_expired'].includes(sub.status),
    [sub]
  );
  const isScheduledForCancelation = sub.status === 'scheduled_for_cancelation';
  const isCanceled = useMemo(() => sub.status === 'canceled', [sub]);

  const subPharm = sub?.order_id?.prescription_id?.pharmacy;
  const refillsLeft =
    (sub.order_id?.prescription_id?.count_of_refills_allowed || 0) -
    (sub.order_id?.refill_count || 0);

  const isDeliveryPharm =
    subPharm?.toLowerCase().includes('gogo') ||
    subPharm?.toLowerCase().includes('tailor-made') ||
    subPharm?.toLowerCase().includes('hallandale') ||
    subPharm?.toLowerCase().includes('empower') ||
    subPharm?.toLowerCase().includes('shollenberger');

  const isManualRefillPharm =
    subPharm?.toLowerCase().includes('tailor-made') ||
    subPharm?.toLowerCase().includes('hallandale') ||
    subPharm?.toLowerCase().includes('empower');

  const isHairLossSolution = [
    'Hair Restore Ultra Scalp Solution',
    'Hair Restore Foam',
  ].some(med => sub?.order_id?.prescription_id?.medication?.includes(med));

  const isHardie = sub?.order_id?.prescription_id?.medication
    ?.toLowerCase()
    ?.includes('hardies');

  const isEnclomiphene = sub?.order_id?.prescription_id?.medication
    ?.toLowerCase()
    ?.includes('enclomiphene');

  const isEDHL = sub?.order_id?.prescription_id?.medication
    ?.toLowerCase()
    ?.includes('tadalafil + finasteride + minoxidil');

  const isSleep = sub?.order_id?.prescription_id?.medication
    ?.toLowerCase()
    ?.includes('ramelteon');

  const isMenopause =
    sub?.order_id?.prescription_id?.medication_quantity_id?.medication_dosage_id?.medication?.display_name
      ?.toLowerCase()
      ?.includes('menopause');

  const isEDMedication =
    sub?.order_id?.prescription_id?.medication_quantity_id?.medication_dosage_id
      ?.medication?.display_name === 'ED Medication';

  const isSkinCare = sub?.care?.toLowerCase().includes('skincare');
  const isHairLoss = sub?.care?.toLowerCase().includes('hair loss');

  const buttonSx = {
    fontSize: '11px',
    lineHeight: '16px',
    fontWeight: '600',
    height: '36px !important',
    padding: '10px 16px',
    color: '#fff',
  };

  const getNowButtonSx = {
    fontSize: '1rem',
    lineHeight: '16px',
    fontWeight: '600',
    height: '36px !important',
    padding: '10px 16px',
    width: '100%',
    color: 'mossGreen',
    borderRadius: '0',
  };

  const cancelButtonSx = {
    fontSize: '11px',
    lineHeight: '16px',
    fontWeight: '600',
    height: '36px !important',
    padding: '10px 16px',
    background: '#E38869',
    color: '#000',
  };

  const handleReactivation = useCallback(async () => {
    await reactivateSubscription.mutateAsync(sub.reference_id!);
    if (!sub.patient_id) return;
    await supabase
      .from('patient_action_item')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('patient_id', sub.patient_id)
      .eq('type', 'CANCELLED_PRESCRIPTION');
    queryClient.invalidateQueries('actionItems');
  }, [queryClient, reactivateSubscription, sub, supabase]);

  const onSuccess = useCallback(async () => {
    const { data: newOrder, error: orderError } = await supabase
      .from('order')
      .insert({
        patient_id: sub.patient_id,
        clinician_id: sub.order_id?.clinician_id,
        national_drug_code: sub.order_id?.national_drug_code,
        prescription_id: sub.order_id?.prescription_id?.id,
        refill_count: (sub.order_id?.refill_count || 0) + 1,
        order_status: 'PAYMENT_SUCCESS',
        amount_paid: sub.order_id?.total_price,
      })
      .select()
      .single();

    if (orderError || !newOrder) {
      throw new Error(
        orderError?.message || 'Could not create new order. Please try again'
      );
    }

    await createMedicationSubscription({
      patientId: sub.patient_id!,
      orderId: newOrder.id,
      recurring: {
        interval: (sub.interval ||
          'month') as MedicationSubscriptionRequestParams['recurring']['interval'],
        interval_count: sub.interval_count || 1,
      },
      cancel_at: daysFromNow(refillsLeft * (sub.interval_count || 1)),
      price: sub.price * 100,
      drugCode: sub.order_id?.national_drug_code,
      idempotencyKey: uniqueKey,
    });

    await supabase
      .from('patient_prescription')
      .update({ visible: false })
      .eq('id', sub.id!);
  }, [
    createMedicationSubscription,
    refillsLeft,
    sub.id,
    sub.interval,
    sub.interval_count,
    sub.order_id?.clinician_id,
    sub.order_id?.national_drug_code,
    sub.order_id?.prescription_id?.id,
    sub.order_id?.refill_count,
    sub.patient_id,
    sub.price,
    sub.order_id?.total_price,
    uniqueKey,
    supabase,
  ]);

  const handleRenewMedicationSubscription = useCallback(async () => {
    if (!sub.patient_id) return;
    const { data, error } = await createInvoicePayment(
      sub.patient_id,
      sub.price * 100,
      { reason: 'renewal' },
      'Medication Subscription Renewal',
      false,
      uniqueKey
    );
    if (error) {
      setFailed(true);
      throw new Error(
        error.message || 'Something went wrong. Please try again'
      );
    }
    if (data) {
      await onSuccess();
    }
  }, [createInvoicePayment, onSuccess, sub, uniqueKey]);

  const handleClose = useCallback(() => {
    refetch();
    setModalOpen(false);
  }, [refetch]);
  const handleOpen = useCallback(() => setModalOpen(true), []);
  const handleOpenRenew = useCallback(() => setOpenRenew(true), []);
  const handleCloseRenew = useCallback(() => {
    refetch();
    setOpenRenew(false);
  }, [refetch]);

  const frequency = useMemo(() => {
    const fullName = isSkinCare
      ? sub?.product || ''
      : sub?.order_id?.prescription_id?.medication_quantity_id
          ?.medication_dosage_id?.medication?.display_name || '';
    if (
      fullName === 'Enclomiphene Medication' &&
      sub?.order_id?.prescription_id?.dispense_quantity === 122
    ) {
      return 'Every 4 months';
    } else if (fullName === 'EDHL Medication') {
      const months =
        (sub?.order_id?.prescription_id?.dispense_quantity || 0) / 30;
      return `Every ${months} month${months === 1 ? '' : 's'}`;
    }
    const numOfMonths = toMonth(sub?.interval, sub?.interval_count);
    const roundedMonths = Math.round(numOfMonths);
    return `Every ${roundedMonths < 2 ? 'month' : `${roundedMonths} months`}`;
  }, [sub, isSkinCare]);

  const bannerText = useMemo(() => {
    if (
      (careSubscription?.status === 'scheduled_for_cancelation' ||
        careSubscription?.status === 'canceled') &&
      (isSkinCare || isHairLoss)
    ) {
      return 'Get now';
    }
    const nextOrderDate = new Date(sub.current_period_end || '');
    const dateFormat = isSameYear(new Date(), nextOrderDate)
      ? 'MMMM d'
      : 'MMMM d, yyyy';
    return (
      statusMap[sub?.status!] ||
      `Next order will be processed ${format(nextOrderDate, dateFormat)}`
    );
  }, [careSubscription?.status, sub, isSkinCare, isHairLoss]);

  const fetchCareSubscription = useCallback(async () => {
    const { data } = await supabase
      .from('patient_subscription')
      .select('*, subscription!inner(*)')
      .eq('patient_id', sub.patient_id!)
      .eq('subscription_id', sub.subscription_id!)
      .maybeSingle();
    setCareSubscription(data as PatientSubscription | null);
  }, [sub.patient_id, sub.subscription_id, supabase]);

  async function checkIfOutstandingReqCompound() {
    if (!sub.id || !sub.order_id?.prescription_id?.medication_quantity_id)
      return;
    const newReq = await supabase
      .from('prescription_request')
      .select()
      .eq('patient_id', sub.patient_id!)
      .gte('created_at', sub.created_at)
      .eq(
        'medication_quantity_id',
        sub.order_id?.prescription_id?.medication_quantity_id
      )
      .or('status.eq.REQUESTED,status.eq.ACCEPTED');
    setIsOutstandingRequest(!!newReq.data?.length);
  }

  async function findExistingRequest() {
    if (!sub.patient_id) return;
    const requests = await supabase
      .from('prescription_request')
      .select(
        `*, medication_quantity ( id, medication_dosage ( medication (*) ) )`
      )
      .eq('patient_id', sub.patient_id)
      .eq('status', 'REQUESTED');
    const dataRequests = requests.data as PrescriptionRequestProps[];
    const fullNameNotSkincare =
      sub?.order_id?.prescription_id?.medication_quantity_id
        ?.medication_dosage_id?.medication?.display_name || '';
    const hasExistingRequest = dataRequests.some(
      r =>
        r.medication_quantity?.medication_dosage?.medication?.display_name ===
        fullNameNotSkincare
    );
    setHasExistingMedRequest(hasExistingRequest);
  }

  useEffect(() => {
    checkIfOutstandingReqCompound();
    fetchCareSubscription();
    findExistingRequest();
  }, []);

  const showGetSoonerButton =
    (isHairLoss || isSkinCare) && sub?.status === 'active';

  const renderGetSoonerButton = () => {
    if (sub.status === 'active' && showGetSoonerButton) {
      return (
        <Button
          type="button"
          variant="outlined"
          sx={getNowButtonSx}
          onClick={handleOpenGetSooner}
        >
          Get Sooner
        </Button>
      );
    }
    return null;
  };

  const handleOpenGetSooner = useCallback(
    () => setGetSoonerModalOpen(true),
    []
  );
  const handleCloseGetSooner = useCallback(() => {
    refetch();
    setGetSoonerModalOpen(false);
  }, [refetch]);

  return (
    <Card
      sx={{
        width: '100%',
        marginBottom: '1rem',
        borderRadius: '1.5rem',
        position: 'relative',
      }}
    >
      <CardContent
        sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <Box
          sx={{
            height: '26px',
            borderRadius: '12px',
            padding: '5px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: sub?.status?.toLowerCase().includes('cancel')
              ? '#FFEAE3'
              : '#FFF0EB',
            marginBottom: '1rem',
          }}
        >
          {showGetSoonerButton ? (
            <Button
              sx={{
                background: sub?.status?.toLowerCase().includes('cancel')
                  ? '#FFEAE3'
                  : '#FFF0EB',
                height: '26px',
                maxHeight: '26px',
                borderRadius: '12px',
                padding: '5px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px !important',
                fontWeight: 'bold',
                color: 'black',
                width: '100%',
                '&:hover': {
                  background: sub?.status?.toLowerCase().includes('cancel')
                    ? '#FFEAE3'
                    : '#dec8c1',
                },
              }}
              onClick={handleOpenGetSooner}
            >
              Get Sooner
            </Button>
          ) : (
            <Typography
              sx={{
                fontSize: '11px !important',
                fontWeight: 'bold',
              }}
            >
              {bannerText}
            </Typography>
          )}
        </Box>

        <CardMedia
          component="img"
          height="193"
          image="/images/lab-work.jpg"
          alt="laboratory"
        />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <Typography
            component="h3"
            variant="h3"
            sx={{
              color: '#1B1B1B',
              fontWeight: '500',
              fontSize: '16px',
            }}
          >
            {isSleep
              ? 'Sleep Support: Ramelteon'
              : isEDHL
              ? 'Tadalafil + Finasteride + Minoxidil'
              : isSkinCare
              ? sub?.order_id?.prescription_id?.medication
              : !isHairLossSolution && !isHardie && !isMenopause
              ? `${sub?.order_id?.prescription_id?.medication?.split(' ')[0]}`
              : sub?.order_id?.prescription_id?.medication}
          </Typography>

          <Stack direction="row" gap={3}>
            {renderGetSoonerButton()}
            {(isCanceled || isScheduledForCancelation) &&
            (isSkinCare || isHairLoss) ? (
              <Button
                type="button"
                variant="outlined"
                sx={getNowButtonSx}
                onClick={handleOpenGetSooner}
              >
                Get now
              </Button>
            ) : isCanceledStatus && refillsLeft > 0 ? (
              <Button type="button" sx={buttonSx} onClick={handleOpenRenew}>
                Renew subscription
              </Button>
            ) : isManualRefillPharm &&
              sub.order_id?.order_status === 'Has Shipped' &&
              !isOutstandingRequest ? (
              <Button
                type="button"
                sx={
                  sub?.status !== 'active' &&
                  sub?.status !== 'requested_renewal'
                    ? cancelButtonSx
                    : buttonSx
                }
                onClick={() =>
                  Router.push('/patient-portal/visit/weight-loss-refill')
                }
              >
                Request refill now
              </Button>
            ) : sub?.order_id?.shipment_details
                ?.toLowerCase()
                .includes('delivered') && !hasExistingMedRequest ? (
              <>
                <Button
                  fullWidth
                  type="button"
                  sx={
                    sub?.status !== 'active' &&
                    sub?.status !== 'requested_renewal'
                      ? cancelButtonSx
                      : buttonSx
                  }
                  onClick={() => {
                    if (sub.status === 'active') {
                      setRefillNow(true);
                      setSelectedSubscription(sub);
                      setPage(
                        isEDMedication ? 'request-medication' : 'change-refill'
                      );
                    }
                    if (isCanceledStatus) {
                      setPage('payment');
                    }
                    if (sub.status === 'ended') {
                      Router.push(
                        `${Pathnames.RENEW_PRESCRIPTION}/${sub?.order_id?.prescription_id?.id}`
                      );
                    }
                  }}
                >
                  Need refill now <br /> {`${refillsLeft} refills left`}
                </Button>
                <Button
                  fullWidth
                  type="button"
                  sx={
                    sub?.status !== 'active' &&
                    sub?.status !== 'requested_renewal'
                      ? cancelButtonSx
                      : buttonSx
                  }
                  onClick={() => {
                    if (sub.status === 'active') {
                      setRefillNow(false);
                      setSelectedSubscription(sub);
                      setPage('change-refill');
                    }
                    if (isCanceledStatus) {
                      setPage('payment');
                    }
                    if (sub.status === 'ended') {
                      Router.push(
                        `${Pathnames.RENEW_PRESCRIPTION}/${sub?.order_id?.prescription_id?.id}`
                      );
                    }
                  }}
                >
                  {buttonMap[sub!.status!] || 'Change refill date'}
                  <br />
                  Adjust next order
                </Button>
              </>
            ) : null}
          </Stack>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            <Typography
              component="h4"
              variant="body1"
              sx={{ color: '#989898' }}
            >
              Dosage Instructions
            </Typography>
            <Typography>
              {isEnclomiphene
                ? `${sub?.order_id?.prescription_id?.dispense_quantity} tablets. ${sub?.order_id?.prescription_id?.dosage_instructions}`
                : isHardie
                ? `${sub?.order_id?.prescription_id?.dispense_quantity} Hardies. Dissolve one troche under tongue daily (maximum of 1 troche per day).`
                : isEDHL
                ? `${sub?.order_id?.prescription_id?.dispense_quantity} troches. ${sub?.order_id?.prescription_id?.dosage_instructions}`
                : sub?.order_id?.prescription_id?.dosage_instructions}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            <Typography
              component="h4"
              variant="body1"
              sx={{ color: '#989898' }}
            >
              Quantity
            </Typography>
            <Typography>
              {isHairLossSolution
                ? '30 ml bottle'
                : isHardie
                ? `${sub?.order_id?.prescription_id?.dispense_quantity} hardies`
                : isEnclomiphene
                ? `${sub?.order_id?.prescription_id?.medication
                    ?.split(' ')
                    .slice(1)
                    .join(' ')}`
                : isSkinCare
                ? `${sub?.order_id?.prescription_id?.dispense_quantity} ${sub?.order_id?.prescription_id?.unit}(s)`
                : isEDHL
                ? 'Tadalafil 5 mg + Finasteride 1 mg + Minoxidil 2.5 mg'
                : `${sub?.order_id?.prescription_id?.dispense_quantity} ${sub?.order_id?.prescription_id?.unit}(s)`}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            <Typography
              component="h4"
              variant="body1"
              sx={{ color: '#989898' }}
            >
              Shipping frequency
            </Typography>
            <Typography>{frequency}</Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            <Typography
              component="h4"
              variant="body1"
              sx={{ color: '#989898' }}
            >
              Delivery Address
            </Typography>
            {isDeliveryPharm ? (
              <>
                <Typography>{patientAddress?.address_line_1}</Typography>
                <Typography>{patientAddress?.address_line_2}</Typography>
                <Typography>
                  {patientAddress?.city}, {patientAddress?.state}
                </Typography>
                <Typography>{patientAddress?.zip_code}</Typography>
                <Typography>United States</Typography>
                <Button
                  variant="text"
                  sx={{
                    justifyContent: 'flex-start',
                    padding: 0,
                    width: 'fit-content',
                    color: '#00872B',
                    height: '24px !important',
                  }}
                  onClick={() => setPage('edit-address')}
                >
                  Edit
                </Button>
              </>
            ) : (
              <>{formattedPharmacy(sub?.order_id?.prescription_id?.pharmacy)}</>
            )}
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            <Typography
              component="h4"
              variant="body1"
              sx={{ color: '#989898' }}
            >
              Payment
            </Typography>
            <Typography>{patientPayment}</Typography>
            <Button
              variant="text"
              sx={{
                justifyContent: 'flex-start',
                padding: 0,
                width: 'fit-content',
                color: '#00872B',
                height: '24px !important',
              }}
              onClick={() => setPage('payment')}
            >
              Edit
            </Button>
          </Box>
        </Box>

        {!isCanceledStatus && !isDetails && (
          <Link
            sx={{ fontWeight: '600', cursor: 'pointer' }}
            onClick={() =>
              Router.push(`${Pathnames.VIEW_SUBSCRIPTIONS}/${sub.id}`)
            }
          >
            Manage Plan
          </Link>
        )}

        <SubscriptionRestartModal
          titleOnSuccess="Your subscription has been reactivated."
          onConfirm={handleReactivation}
          onClose={handleClose}
          title="Reactivate your subscription?"
          description={[
            'Once you confirm below, your subscription will become active.',
          ]}
          open={modalOpen}
          buttonText="Yes, reactivate"
        />

        <SubscriptionRestartModal
          titleOnSuccess="Your subscription has been reactivated."
          onConfirm={handleRenewMedicationSubscription}
          onClose={handleCloseRenew}
          title="Reactivate your subscription?"
          description={[
            'Once you confirm below, your subscription will become active.',
          ]}
          open={openRenew}
          buttonText="Yes, reactivate"
        />
      </CardContent>

      <ExpeditedShipping
        open={getSoonerModalOpen}
        onClose={handleCloseGetSooner}
        subscription={sub as unknown as ExtendedSubscription}
      />
    </Card>
  );
};

export default SubscriptionCard;
