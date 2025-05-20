import { differenceInDays, format, isBefore, subDays } from 'date-fns';
import { Box, Button, Stack, Typography, Divider, Link } from '@mui/material';
import medNameFilter from '@/utils/medicationNameFilter';
import StatusBar from './components/StatusBar';
import {
  Prescription,
  useAllVisiblePatientSubscription,
  usePatientAddress,
  usePaymentMethodUpdatedRecently,
} from '@/components/hooks/data';
import { OrderStatus } from '@/types/orderStatus';
import { isWeightLossMed } from '@/utils/isWeightLossMed';
import { orderStatusMap, getShipmentStatus } from '@/utils/orderStatus';
import { OrderProps } from '@/components/screens/Prescriptions/OrderHistoryContent';
import { PatientSubscriptionProps } from '@/lib/auth';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import SubscriptionRestartModal from '@/components/shared/SubscriptionRestartModal';
import { useCallback, useMemo, useState } from 'react';
import {
  useReactivateSubscription,
  useRenewSubscription,
} from '@/components/hooks/mutations';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { useQueryClient } from 'react-query';
import ExpeditedShipping, {
  ExtendedSubscription,
} from '@/components/screens/Prescriptions/components/ExpeditedShipping';
import { uuid } from 'uuidv4';
import PrescriptionRenewConfirmationModal from '@/components/screens/Profile/components/PatientPrescriptions/PrescriptionRenewConfirmationModal';

export interface CanceledSubscription extends PatientSubscriptionProps {}

const isExtendedSubscription = (
  sub: PatientSubscriptionProps
): sub is ExtendedSubscription & PatientSubscriptionProps =>
  (('order_id' in sub && Boolean(sub.order_id)) ||
    ('order' in sub && Boolean(sub.order))) &&
  (('order_id' in sub &&
    sub.order_id &&
    typeof sub.order_id === 'object' &&
    'prescription_id' in sub.order_id) ||
    ('order' in sub &&
      sub.order !== null &&
      typeof sub.order === 'object' &&
      'prescription' in sub.order));

interface Props {
  order: OrderProps;
  subscriptions?: PatientSubscriptionProps[];
  isCompoundCard: boolean;
  isFailedPayment?: boolean;
  refetchSubs?: () => void;
  patientPharmacy?: any;
}

const OrderTracker = ({
  order,
  subscriptions,
  isCompoundCard,
  isFailedPayment,
  refetchSubs,
  patientPharmacy,
}: Props) => {
  const isMobile = useIsMobile();
  const { data: address } = usePatientAddress();
  const reactivatePrescription = useReactivateSubscription();
  const renewPrescription = useRenewSubscription();
  const supabase = useSupabaseClient<Database>();
  const { data: allVisiblePatientSubscriptions } =
    useAllVisiblePatientSubscription();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalRenewPrescriptionOpen, setRenewPrescriptionModalOpen] =
    useState(false);

  const [getSoonerModalOpen, setGetSoonerModalOpen] = useState(false);
  const uniqueKey = useMemo(() => uuid(), []);
  const paymentMethodUpdatedRecently = usePaymentMethodUpdatedRecently();

  function getStatusDescription(
    status: OrderStatus,
    carrier?: string | null,
    address?: string | null,
    isCompounded?: boolean
  ) {
    let description = '';
    switch (status) {
      case OrderStatus.BUNDLED_REFILL_2:
        description = `This pending order is for your second month refill`;
        break;
      case OrderStatus.BUNDLED_REFILL_3:
        description = `This pending order is for your third month refill`;
        break;
      case OrderStatus.RECEIVED:
      case OrderStatus.PROCESSING:
        description = `Your order is being processed and will ship within ${
          isCompounded ? '5-7' : '3-4'
        } business days.`;
        break;
      case OrderStatus.IN_SHIPPING:
        description = `Your order is in shipping`;
        break;
      case OrderStatus.SHIPPED:
        description = `Your order ${
          carrier?.length ? `is being shipped by ${carrier}` : 'has shipped'
        } and should arrive within ${
          isCompounded ? '2' : '3-4'
        } business days.`;
        break;
      case OrderStatus.OUT_FOR_DELIVERY:
        description = `Your order will be arriving${
          address ? ` to ${address}` : ''
        } soon.`;
        break;
      case OrderStatus.COMPLETE:
        description = `Your order has been completed successfully`;
        break;
    }
    return description;
  }

  const terminalStatuses = [
    OrderStatus.DELIVERED,
    OrderStatus.COMPLETE,
    OrderStatus.CANCELED,
    OrderStatus.SENT_TO_LOCAL_PHARMACY,
  ];
  const getNowButtonSx = {
    fontSize: '16px',
    lineHeight: '16px',
    fontWeight: '600',
    height: '36px !important',
    padding: '10px 16px',
    width: '50%',
    color: 'mossGreen',
    borderRadius: '.5rem',
    margin: '.5rem',
  };

  const psychMedicationNames = [
    'metformin',
    'bupropion',
    'naltrexone',
    'citalopram',
    'escitalopram',
    'fluoxetine',
    'paroxetine',
    'sertraline',
  ];

  const isOTCMedication = ['melatonin', 'probiotic', 'magnesium'].some(med =>
    order?.prescription_id?.medication?.toLowerCase()?.includes(med)
  );
  const isPsychOrder = psychMedicationNames.some(med =>
    order?.prescription_id?.medication?.toLowerCase().includes(med)
  );

  const scheduledForCancelationSub = subscriptions?.find(
    subscription => subscription.status === 'scheduled_for_cancelation'
  );

  const isCanceledSubscription = (
    subscription: PatientSubscriptionProps
  ): subscription is CanceledSubscription =>
    (subscription.status === 'canceled' ||
      subscription.status === 'scheduled_for_cancelation') &&
    'order_id' in subscription &&
    subscription.order_id !== undefined &&
    'care' in subscription &&
    subscription.care !== undefined;

  const canceledOrScheduledSubscription = useMemo(() => {
    return allVisiblePatientSubscriptions?.find(
      sub =>
        isCanceledSubscription(sub) &&
        sub.order?.prescription?.id === order.prescription_id?.id &&
        [
          'ED',
          'Enclomiphene',
          'Erectile dysfunction',
          'Hair loss',
          'Skincare',
        ].includes(sub.care || '')
    );
  }, [allVisiblePatientSubscriptions, order.prescription_id?.id]);

  const canceledSub = useMemo(
    () => subscriptions?.find(isCanceledSubscription),
    [subscriptions]
  );

  let daysUntilCancellation = 0;
  if (scheduledForCancelationSub?.cancel_at) {
    daysUntilCancellation = differenceInDays(
      new Date(scheduledForCancelationSub.cancel_at),
      new Date()
    );
  }

  const handleOpen = useCallback(() => setModalOpen(true), []);
  const handleClose = useCallback(() => setModalOpen(false), []);

  const handleReactivation = useCallback(async () => {
    if (scheduledForCancelationSub) {
      await reactivatePrescription.mutateAsync(
        scheduledForCancelationSub.reference_id!
      );
    } else if (canceledSub) {
      await renewPrescription.mutateAsync(canceledSub);
    }
    refetchSubs?.();
    if (scheduledForCancelationSub?.patient_id) {
      await supabase
        .from('patient_action_item')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('patient_id', scheduledForCancelationSub.patient_id)
        .eq('type', 'CANCELLED_PRESCRIPTION');
    }
    queryClient.invalidateQueries(['actionItems']);
  }, [
    reactivatePrescription,
    scheduledForCancelationSub,
    supabase,
    canceledSub,
    refetchSubs,
    queryClient,
    renewPrescription,
  ]);

  const handleReactivateMedSubscription = useCallback(async () => {
    return setRenewPrescriptionModalOpen(true);
  }, []);

  const shipmentStatus = getShipmentStatus(order);
  const orderStatus = orderStatusMap[order?.order_status || ''];
  const status =
    orderStatus === OrderStatus.CANCELED
      ? OrderStatus.CANCELED
      : shipmentStatus || orderStatus;

  const patientAddress = `${address?.address_line_1} ${address?.address_line_2}`;
  const isCompoundGLP1 = order?.prescription_id?.medication_quantity_id === 98;
  const isHardie = order?.prescription_id?.medication
    ?.toLowerCase()
    ?.includes('hardies');
  const isEDHL = order?.prescription_id?.medication
    ?.toLowerCase()
    ?.includes('tadalafil + finasteride + minoxidil');
  const statusDescription = getStatusDescription(
    status,
    order?.delivery_provider,
    patientAddress,
    isCompoundGLP1
  );

  let medName = order?.prescription_id?.medication;
  if (medName) {
    if (isHardie || isEDHL) {
      medName = isEDHL ? medName.replace('Standard Dose', '') : medName;
    } else if (medName.toLowerCase().includes('oral semaglutide')) {
      medName = medName.split(' ').slice(0, 2).join(' ');
    } else if (medName.toLowerCase().includes('naltrexone')) {
      medName = 'Bupropion HCL SR 150 MG Tablet + Naltrexone HCL 5 MG Capsule';
    } else if (medName.toLowerCase().includes('acne ultra')) {
      medName = 'ACNE ULTRA (CLINDAMYCIN / NIACINAMIDE / TRETINOIN)';
    } else {
      medName = medName.charAt(0).toUpperCase() + medName.slice(1);
      medName = medNameFilter(medName);
      medName = medName.split(' ')[0];
    }
  }

  if (order.updated_at) {
    const currentDate = new Date();
    const tenDaysAgo = subDays(currentDate, 10);
    const thirtyDaysAgo = subDays(currentDate, 30);
    const lastUpdated = new Date(order.updated_at);
    if (terminalStatuses.includes(status)) {
      if (
        (status === OrderStatus.SENT_TO_LOCAL_PHARMACY &&
          isBefore(lastUpdated, thirtyDaysAgo)) ||
        (status !== OrderStatus.SENT_TO_LOCAL_PHARMACY &&
          isBefore(lastUpdated, tenDaysAgo))
      ) {
        return null;
      }
    }
  }

  if (
    [
      'BUNDLED_REFILL_2',
      'BUNDLED_REFILL_3',
      'ORDER_PENDING_ACTION',
      'ORDER_PENDING_REACTIVATION',
      'PENDING_SKINCARE_ORDER',
    ].includes(order.order_status || '')
  ) {
    return null;
  }

  const extendedSubscriptions: ExtendedSubscription[] =
    (allVisiblePatientSubscriptions?.filter(
      isExtendedSubscription
    ) as unknown as ExtendedSubscription[]) || [];

  const isSubscriptionAssociatedWithOrder = (
    sub: ExtendedSubscription,
    order: OrderProps
  ): boolean => {
    const prescriptionId =
      sub.order_id?.prescription_id?.id || sub.order?.prescription?.id;
    return prescriptionId === order.prescription_id?.id;
  };

  const subscriptionToExpedite = extendedSubscriptions.find(
    sub =>
      sub.status.toLowerCase().includes('cancel') &&
      isSubscriptionAssociatedWithOrder(sub, order)
  );
  const showGetNowButton =
    !!subscriptionToExpedite &&
    [
      'ED',
      'Enclomiphene',
      'Erectile dysfunction',
      'Hair loss',
      'Skincare',
    ].includes(subscriptionToExpedite?.care || '');

  const orderPrescribedMessage = `Your ${
    medName || ''
  } order was prescribed on ${format(
    new Date(order?.created_at || ''),
    'MMMM d, yyyy'
  )}.`;

  const messageContent = isFailedPayment ? (
    <>
      Please{' '}
      <Link href="/patient-portal/profile/update-payment">
        update your payment method
      </Link>{' '}
      in order to have your Rx shipped to you.
    </>
  ) : order?.tracking_number ? (
    <>
      Please{' '}
      <Link
        href={`https://www.google.com/search?q=${order?.tracking_number}`}
        target="_blank"
      >
        track your order
      </Link>{' '}
      to check on the status of your order.
    </>
  ) : (
    <>
      Please{' '}
      <Link href="/messages?complete=weight-loss">message your care team</Link>{' '}
      if you have any questions about the status of your order.
    </>
  );

  return !order.order_status?.toLowerCase()?.includes('cancel') ? (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        background: '#FFFFFF',
        border: isCompoundCard ? '' : '0.5px solid #CCCCCC',
        borderRadius: '16px',
        flexDirection: 'column',
        overflow: 'visible',
      }}
    >
      {showGetNowButton && (
        <Button
          sx={{
            fontSize: '16px',
            background: '#FFD9CC',
            height: '26px',
            width: '100%',
            padding: '1.5rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'start',
            marginBottom: '.5rem',
            paddingLeft: '10px',
            fontWeight: 550,
            borderBottomRightRadius: 0,
            borderBottomLeftRadius: 0,
            color: 'black',
            '&:hover': {
              background: '#FFF0EB',
            },
          }}
          onClick={() => setGetSoonerModalOpen(true)}
        >
          Get now
        </Button>
      )}
      <Stack gap={isMobile ? '0.5rem' : '1rem'} width="100%" padding="12px">
        <Typography
          sx={{
            fontSize: isMobile ? '14px' : '17px',
            fontWeight: 'bold',
            lineHeight: '25px',
          }}
        >
          {orderPrescribedMessage}
        </Typography>
        <Typography
          sx={{
            fontSize: isMobile ? '14px' : '17px',
            fontWeight: 'bold',
            lineHeight: '25px',
            mb: isFailedPayment ? '0.5rem' : undefined,
          }}
        >
          {messageContent}
        </Typography>
        {statusDescription && <Typography>{statusDescription}</Typography>}
        {subscriptions?.length &&
          canceledOrScheduledSubscription &&
          !isOTCMedication && (
            <Typography>
              To continue getting {medName} and other services from Zealthy,{' '}
              <b>
                <Link
                  sx={{ cursor: 'pointer' }}
                  onClick={handleReactivateMedSubscription}
                >
                  reactivate your membership
                </Link>
              </b>
              .<br />
              <br />
              {isWeightLossMed(medName || '') &&
                `You cannot order new medication without an active Zealthy weight loss membership because we must be able to safely monitor your care.`}
            </Typography>
          )}
        {status === OrderStatus.SENT_TO_LOCAL_PHARMACY && patientPharmacy && (
          <Stack>
            <Typography>Your order was sent to:</Typography>
            <Typography>{patientPharmacy?.name || ''}</Typography>
            <Typography>{patientPharmacy?.pharmacy || ''}</Typography>
            {patientPharmacy?.phoneNumber && (
              <Typography>
                Phone:{' '}
                <a href={`tel:${patientPharmacy.phoneNumber}`}>
                  {patientPharmacy.phoneNumber}
                </a>
              </Typography>
            )}
          </Stack>
        )}
        {status && status !== OrderStatus.SENT_TO_HALLANDALE && (
          <StatusBar status={status} />
        )}
        {!isCompoundCard && order?.tracking_number && (
          <Stack>
            <Typography>Tracking Number</Typography>
            <Link
              target="_blank"
              href={`https://www.google.com/search?q=${order?.tracking_number}`}
            >
              {order?.tracking_number}
            </Link>
          </Stack>
        )}
      </Stack>
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
      {subscriptions?.length &&
        canceledOrScheduledSubscription?.order?.prescription &&
        !isOTCMedication && (
          <PrescriptionRenewConfirmationModal
            isOpen={modalRenewPrescriptionOpen}
            prescription={canceledOrScheduledSubscription}
            onClose={() => setRenewPrescriptionModalOpen(false)}
          />
        )}
      {showGetNowButton && canceledSub && (
        <>
          <Button
            sx={getNowButtonSx}
            onClick={() => setGetSoonerModalOpen(true)}
          >
            Get now
          </Button>
          <ExpeditedShipping
            open={getSoonerModalOpen}
            onClose={setGetSoonerModalOpen}
            subscription={subscriptionToExpedite as ExtendedSubscription}
            refetchSubs={refetchSubs}
          />
        </>
      )}
    </Box>
  ) : null;
};

export default OrderTracker;
