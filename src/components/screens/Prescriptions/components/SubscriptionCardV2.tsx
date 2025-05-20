import Router from 'next/router';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Typography,
  Link as MuiLink,
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
import SyncIcon from '@mui/icons-material/Sync';
import {
  edPrograms,
  performancePrograms,
} from '../../DiscoverCare/components/programs-data';
import { usePatient } from '@/components/hooks/data';
import ExpeditedShipping from './ExpeditedShipping';

type Address = Database['public']['Tables']['address']['Row'];
type Subscription = Database['public']['Tables']['subscription']['Row'];
type PatientSubscription =
  Database['public']['Tables']['patient_subscription']['Row'] & {
    subscription: Subscription;
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
  const { createInvoicePayment, createMedicationSubscription } = usePayment();
  const reactivateSubscription = useReactivateSubscription();

  const [modalOpen, setModalOpen] = useState(false);
  const [openRenew, setOpenRenew] = useState(false);
  const [isOutstandingRequest, setIsOutstandingRequest] = useState(false);
  const [hasExistingMedRequest, setHasExistingMedRequest] = useState(false);
  const [getSoonerModalOpen, setGetSoonerModalOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const uniqueKey = useMemo(() => uuid(), [failed]);
  const [careSubscriptionStatus, setCareSubscriptionStatus] = useState<
    string | null
  >(null);

  const { data: patient } = usePatient();
  const programs = useMemo(() => {
    if (!patient) return [];
    return [...edPrograms(patient), ...performancePrograms];
  }, [patient]);

  const isCancelledStatus = useMemo(
    () => sub?.status && ['cancel'].includes(sub.status),
    [sub]
  );

  // Instead of remapping order_id to order and prescription_id to prescription,
  // we now simply work with the original fields.
  const orderObj = sub.order_id;
  const prescriptionObj = orderObj?.prescription_id;

  const subPharm = prescriptionObj?.pharmacy || '';
  const refillsLeft = useMemo(
    () =>
      (prescriptionObj?.count_of_refills_allowed || 0) -
      (orderObj?.refill_count || 0),
    [sub]
  );

  const isDeliveryPharm = useMemo(() => {
    const pharm = subPharm.toLowerCase();
    return (
      pharm.includes('gogo') ||
      pharm.includes('tailor-made') ||
      pharm.includes('hallandale') ||
      pharm.includes('empower')
    );
  }, [subPharm]);

  const isManualRefillPharm = useMemo(() => {
    const pharm = subPharm.toLowerCase();
    return (
      pharm.includes('tailor-made') ||
      pharm.includes('hallandale') ||
      pharm.includes('empower')
    );
  }, [subPharm]);

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
  }, [reactivateSubscription, sub, queryClient, supabase]);

  const onSuccess = useCallback(async () => {
    const newOrder = await supabase
      .from('order')
      .insert({
        patient_id: sub.patient_id,
        clinician_id: orderObj?.clinician_id,
        national_drug_code: orderObj?.national_drug_code,
        prescription_id: prescriptionObj?.id,
        refill_count: (orderObj?.refill_count || 0) + 1,
        order_status: 'PAYMENT_SUCCESS',
        amount_paid: orderObj?.total_price,
      })
      .select()
      .single()
      .then(({ data }) => data);
    if (!newOrder) {
      throw new Error('Could not create new order. Please try again');
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
      drugCode: orderObj?.national_drug_code,
      idempotencyKey: uniqueKey,
    });
    await supabase
      .from('patient_prescription')
      .update({ visible: false })
      .eq('id', sub.id!);
  }, [
    createMedicationSubscription,
    supabase,
    sub,
    refillsLeft,
    uniqueKey,
    orderObj,
    prescriptionObj,
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
    refetch?.();
    if (error) {
      setFailed(true);
      throw new Error(error.message || 'Something went wrong');
    }
    if (data) {
      await onSuccess();
    }
  }, [createInvoicePayment, onSuccess, sub, uniqueKey, refetch]);

  const handleClose = useCallback(() => {
    refetch?.();
    setModalOpen(false);
  }, [refetch]);
  const handleCloseRenew = useCallback(() => {
    refetch?.();
    setOpenRenew(false);
  }, [refetch]);

  const [medDisplayname, setMedDisplayname] = useState('');
  useEffect(() => {
    const med = prescriptionObj?.medication || '';
    setMedDisplayname(med.trim());
  }, [prescriptionObj]);

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

  const frequency = useMemo(() => {
    if (
      medDisplayname.toLowerCase().includes('enclomiphene') &&
      prescriptionObj?.dispense_quantity === 122
    ) {
      return 'Every 4 months';
    }
    const numOfMonths = toMonth(sub?.interval, sub?.interval_count);
    const rounded = Math.round(numOfMonths);
    return `Every ${rounded < 2 ? 'month' : `${rounded} months`}`;
  }, [sub, medDisplayname]);

  const fetchCareSubscription = useCallback(async () => {
    const { data } = await supabase
      .from('patient_subscription')
      .select('*, subscription!inner(*)')
      .eq('patient_id', sub.patient_id!)
      .eq('subscription_id', sub.subscription_id!)
      .maybeSingle();
    const rec = data as PatientSubscription | null;
    setCareSubscriptionStatus(rec?.status || null);
  }, [supabase, sub.patient_id, sub.subscription_id]);

  async function checkIfOutstandingReqCompound() {
    if (!sub.id || !prescriptionObj?.medication_quantity_id) return;
    const newReq = await supabase
      .from('prescription_request')
      .select()
      .eq('patient_id', sub.patient_id!)
      .gte('created_at', sub.created_at)
      .eq('medication_quantity_id', prescriptionObj?.medication_quantity_id)
      .or('status.eq.REQUESTED,status.eq.ACCEPTED');
    setIsOutstandingRequest(!!newReq.data?.length);
  }

  async function findExistingRequest() {
    if (!sub.patient_id) return;
    const { data } = await supabase
      .from('prescription_request')
      .select(
        `*, medication_quantity ( id, medication_dosage ( medication (*) ) )`
      )
      .eq('patient_id', sub.patient_id)
      .eq('status', 'REQUESTED');
    const requests = data as PrescriptionRequestProps[];
    const found = requests.some(
      r =>
        r.medication_quantity?.medication_dosage?.medication?.display_name ===
        medDisplayname
    );
    setHasExistingMedRequest(found);
  }

  useEffect(() => {
    checkIfOutstandingReqCompound();
    findExistingRequest();
    fetchCareSubscription();
  }, []);

  const isEDMedication = useMemo(() => {
    const medicationName = prescriptionObj?.medication
      ?.split(' ')[0]
      ?.toLowerCase();
    return !!['cialis', 'viagra', 'tadalafil', 'sildenafil'].find(
      m => m === medicationName
    );
  }, [prescriptionObj?.medication]);

  const isHardie = useMemo(
    () => medDisplayname.toLowerCase().includes('hardies'),
    [medDisplayname]
  );
  const isEnclomiphene = useMemo(
    () => medDisplayname.toLowerCase().includes('enclomiphene'),
    [medDisplayname]
  );

  const handleOpenGetSooner = useCallback(() => {
    setGetSoonerModalOpen(true);
  }, []);
  const handleCloseGetSooner = useCallback(() => {
    refetch?.();
    setGetSoonerModalOpen(false);
  }, [refetch]);

  const buttonSx = {
    fontSize: '11px',
    lineHeight: '16px',
    fontWeight: '600',
    height: '36px !important',
    padding: '10px 16px',
    color: '#fff',
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

  const bannerText = useMemo(() => {
    if (
      careSubscriptionStatus === 'scheduled_for_cancelation' ||
      careSubscriptionStatus === 'canceled'
    ) {
      return 'Get now';
    }
    const nextOrderDate = new Date(sub.current_period_end || '');
    const dateFormat = isSameYear(new Date(), nextOrderDate)
      ? 'MMMM d'
      : 'MMMM d, yyyy';
    return (
      {
        ended: 'Prescription expired. Renew prescription today',
        requested_renewal:
          'Prescription request sent to medical team for review.',
        incomplete: 'Payment failed. Update payment method',
        incomplete_expired: 'Canceled',
        scheduled_for_cancelation: 'Get now',
        canceled: 'Get now',
      }[sub?.status!] ||
      `Next order will be processed ${format(nextOrderDate, dateFormat)}`
    );
  }, [careSubscriptionStatus, sub]);

  return (
    <Card
      sx={{
        width: '100%',
        mb: '1rem',
        borderRadius: '1.5rem',
        position: 'relative',
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          borderRadius: '30rem',
        }}
      >
        {bannerText === 'Get now' && (
          <Button
            sx={{
              background: '#FFEAE3',
              height: '26px',
              maxHeight: '26px',
              borderRadius: '12px',
              p: '5px',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px !important',
              fontWeight: 'bold',
              color: 'black',
              width: '100%',
              '&:hover': { background: '#FFF0EB' },
            }}
            onClick={handleOpenGetSooner}
          >
            {bannerText}
          </Button>
        )}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '1rem',
              pt: '.5rem',
              boxShadow: '0px 4px 10px 0px rgba(0, 0, 0, 0.10)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                borderBottom: '0.5px solid lightGray',
              }}
            >
              {(() => {
                const lowerMed = medDisplayname.toLowerCase();
                if (lowerMed.includes('sildenafil citrate')) {
                  return (
                    <CardMedia
                      component="img"
                      image="https://api.getzealthy.com/storage/v1/object/public/images/programs/viagra_pill.svg"
                      alt="Viagra / ED"
                      sx={{ height: '25%', width: '25%' }}
                    />
                  );
                }
                if (lowerMed.includes('tadalafil citrate')) {
                  return (
                    <CardMedia
                      component="img"
                      image="https://api.getzealthy.com/storage/v1/object/public/images/programs/cialis.svg"
                      alt="Cialis / ED"
                      sx={{ height: '25%', width: '25%' }}
                    />
                  );
                }
                if (lowerMed.includes('enclomiphene')) {
                  return (
                    <CardMedia
                      component="img"
                      image="https://api.getzealthy.com/storage/v1/object/public/images/programs/enclom-pill.svg"
                      alt="Enclomiphene"
                      sx={{ height: '25%', width: '25%' }}
                    />
                  );
                }
                const match = programs.find(
                  p => p.header?.toLowerCase() === lowerMed
                );
                if (match) {
                  const imgSrc =
                    typeof match.image === 'string'
                      ? match.image
                      : match.image?.src;
                  return (
                    <CardMedia
                      component="img"
                      image={imgSrc}
                      alt={match.header}
                      sx={{ height: '25%', width: '25%' }}
                    />
                  );
                }
                return null;
              })()}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  mb: '0.5rem',
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'start',
                    justifyContent: 'space-between',
                    px: '1rem',
                    mb: '0.5rem',
                  }}
                >
                  <Typography
                    component="h3"
                    variant="h3"
                    sx={{
                      color: '#1B1B1B',
                      fontWeight: '500',
                      wordBreak: 'break-word',
                      flexGrow: 1,
                    }}
                  >
                    {medDisplayname}
                  </Typography>
                  <Box
                    sx={{
                      background:
                        sub?.status === 'ended' ? '#FFEAE3' : '#FFFF9F',
                      height: '26px',
                      borderRadius: '10px',
                      px: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      component="p"
                      variant="body2"
                      sx={{ fontSize: '11px' }}
                    >
                      Rx
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    ml: '0.8rem',
                  }}
                >
                  <SyncIcon />
                  <Typography
                    component="p"
                    variant="body2"
                    sx={{
                      fontSize: '11px',
                      color: 'gray',
                      fontWeight: 'bold',
                    }}
                  >
                    {bannerText === 'Get now'
                      ? 'Renew Subscription'
                      : bannerText}
                  </Typography>
                </Box>
              </Box>
            </Box>
            {bannerText === 'Get now' ? (
              <Button
                variant="text"
                sx={{
                  borderRadius: 0,
                  background:
                    sub?.status === 'ended' ? '#FFEAE3' : 'transparent',
                }}
                onClick={handleOpenGetSooner}
              >
                Get Now
              </Button>
            ) : (
              <Button
                variant="text"
                sx={{
                  borderRadius: 0,
                  background: 'transparent',
                }}
                onClick={handleOpenGetSooner}
              >
                Get Sooner
              </Button>
            )}
          </Box>
          <ExpeditedShipping
            open={getSoonerModalOpen}
            onClose={handleCloseGetSooner}
            subscription={sub as any}
            refetchSubs={refetch}
          />
          <Stack direction="row" gap={3}>
            {isManualRefillPharm &&
            orderObj?.order_status === 'Has Shipped' &&
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
            ) : orderObj?.shipment_details
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
                      if (isEDMedication || isEnclomiphene) {
                        setPage('request-medication');
                      } else {
                        setPage('change-refill');
                      }
                    }
                    if (isCancelledStatus) {
                      setPage('payment');
                    }
                    if (sub.status === 'ended') {
                      Router.push(
                        `${Pathnames.RENEW_PRESCRIPTION}/${prescriptionObj?.id}`
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
                      if (isEnclomiphene || isEDMedication) {
                        setPage('request-medication');
                      } else {
                        setPage('change-refill');
                      }
                    }
                    if (isCancelledStatus) {
                      setPage('payment');
                    }
                    if (sub.status === 'ended') {
                      Router.push(
                        `${Pathnames.RENEW_PRESCRIPTION}/${prescriptionObj?.id}`
                      );
                    }
                  }}
                >
                  Change refill date <br /> Adjust next order
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
              {medDisplayname === 'Enclomiphene'
                ? `${sub?.order_id?.prescription_id?.dispense_quantity} tablets. ${sub?.order_id?.prescription_id?.dosage_instructions}`
                : sub?.order_id?.prescription_id?.dosage_instructions || ''}
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
              {isEnclomiphene
                ? `${prescriptionObj?.dispense_quantity} tablets`
                : isHardie
                ? `${prescriptionObj?.dispense_quantity} Hardies. Dissolve one troche under tongue daily.`
                : prescriptionObj?.dispense_quantity}
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
                    p: 0,
                    width: 'fit-content',
                    color: '#00872B',
                    height: '24px',
                  }}
                  onClick={() => setPage('edit-address')}
                >
                  Edit
                </Button>
              </>
            ) : formattedPharmacy(sub?.order_id?.prescription_id?.pharmacy) ? (
              <>{formattedPharmacy(sub?.order_id?.prescription_id?.pharmacy)}</>
            ) : (
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
                    height: '24px',
                  }}
                  onClick={() => setPage('edit-address')}
                >
                  Edit
                </Button>
              </>
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
                p: 0,
                width: 'fit-content',
                color: '#00872B',
                height: '24px',
              }}
              onClick={() => setPage('payment')}
            >
              Edit
            </Button>
          </Box>
        </Box>
        {!isCancelledStatus && !isDetails && (
          <MuiLink
            sx={{ fontWeight: '600', cursor: 'pointer' }}
            onClick={() =>
              Router.push(`${Pathnames.VIEW_SUBSCRIPTIONS}/${sub.id}`)
            }
          >
            Manage Plan
          </MuiLink>
        )}
        <SubscriptionRestartModal
          titleOnSuccess="Your subscription has been reactivated."
          onConfirm={handleReactivation}
          onClose={handleClose}
          title="Reactivate your subscription?"
          description={[
            'Once you confirm below, your subscription becomes active.',
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
            'Once you confirm below, your subscription becomes active.',
          ]}
          open={openRenew}
          buttonText="Yes, reactivate"
        />
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;
