import { OrderProps } from '@/components/screens/Prescriptions/OrderHistoryContent';
import {
  CompoundMatrixProps,
  PatientSubscriptionProps,
  useAllPatientPrescriptionRequest,
  useIsBundled,
  usePatientOrders,
} from '@/components/hooks/data';
import {
  useReactivateSubscription,
  useRenewSubscription,
} from '@/components/hooks/mutations';
import { useTheme } from '@mui/system';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Router from 'next/router';
import { addDays, differenceInDays, format } from 'date-fns';
import medNameFilter from '@/utils/medicationNameFilter';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Typography,
} from '@mui/material';
import { isWeightLossMed } from '@/utils/isWeightLossMed';
import { AddToCalendarButton } from 'add-to-calendar-button-react';
import { Pathnames } from '@/types/pathnames';
import OrderTracker from '@/components/screens/PatientPortal/components/OrderTracker';
import Link from 'next/link';
import Icon from '@mui/material/Icon';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { StandardModal } from '@/components/shared/modals';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { UpdatePayment } from '@/components/shared/UpdatePatientInfo';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';

const statusMap: { [key: string]: string } = {
  PENDING: 'In progress',
  PAYMENT_SUCCESS: 'Paid and pending shipping',
  SENT_TO_GOGOMEDS: 'Shipment in progress',
  SENT_TO_LOCAL_PHARMACY: 'Submitted to local pharmacy',
  SENT_TO_TAILOR_MADE: 'Paid and pending shipping',
  SENT_TO_HALLANDALE: 'Paid and pending shipping',
  BUNDLED_REFILL_2: 'Pending Refill (2nd month)',
  BUNDLED_REFILL_3: 'Pending Refill (3rd month)',
  ORDER_CREATED: 'In progress',
  Received: 'In progress',
  RECEIVED: 'In progress',
  'Order Received': 'Paid and pending shipping',
  'Invoice Created': 'Paid and pending shipping',
  'In Dispensary': 'Paid and pending shipping',
  'In Shipping': 'In Shipping',
  'Has Shipped': 'In Shipping',
  'Order Canceled': 'Order Canceled',
  'Picked Up': 'In Shipping',
  PAYMENT_FAILED: 'Payment unsuccessful',
  DELIVERED: 'Delivered',
  SHIPPED: 'Shipment in progress',
  Complete: 'Shipment in progress',
  Processing: 'In progress',
  TEST_ORDER: 'Test order',
  OUT_FOR_DELIVERY: 'Out for delivery',
  CANCELED: 'Canceled',
};

const statusColorMap: { [key: string]: string } = {
  'In progress': '#FFF4CD',
  'Shipment in progress': '#FFF4CD',
  'Paid and pending shipping': '#FFF4CD',
  'Submitted to local pharmacy': '#F4F7F1',
  'Payment unsuccessful': '#FFEAE3',
  Delivered: '#F4F7F1',
  Shipped: '#F4F7F1',
};

function getOrderStatus(order: OrderProps) {
  let status = statusMap.PENDING;
  const orderStatus = order.order_status;
  const shipmentDetails = order.shipment_details;
  if (shipmentDetails) {
    const details = shipmentDetails.toLocaleLowerCase();
    if (details.includes('delivered')) {
      status = statusMap.DELIVERED;
    } else if (details.includes('in_transit')) {
      status = statusMap.SHIPPED;
    } else if (details.includes('on its way')) {
      status = statusMap.SHIPPED;
    } else if (details.includes('Pending')) {
      status = statusMap.PENDING;
    } else if (details.includes('Has Shipped')) {
      status = statusMap.DELIVERED;
    } else if (details.includes('In Shipping')) {
      status = statusMap.SHIPPED;
    } else if (details.includes('pre_transit')) {
      status = statusMap.PENDING;
    } else {
      status = shipmentDetails;
    }
  } else if (orderStatus) {
    status = statusMap[orderStatus];
  }

  return status;
}

interface Props {
  order: OrderProps[];
  refetchOrder: () => void;
  subscriptions?: any;
  matrixData?: CompoundMatrixProps[];
  isBundle?: boolean;
  recurringWeightLossPrescription?: PatientSubscriptionProps;
  refetchSubs?: () => void;
}
type OralGlpDosageMatrix =
  Database['public']['Tables']['oral_dosage_matrix']['Row'];

const OrderOralCompoundCard = ({
  order,
  refetchOrder,
  subscriptions,
  isBundle = true,
  recurringWeightLossPrescription,
  refetchSubs,
}: Props) => {
  const { data: prescriptionRequest } = useAllPatientPrescriptionRequest();
  const renewPrescription = useRenewSubscription();
  const { data: isBundled, isLoading: isBundledLoading } = useIsBundled();
  const reactivatePrescription = useReactivateSubscription();
  const isMobile = useIsMobile();

  const supabase = useSupabaseClient<Database>();
  const theme = useTheme();

  const [correctOrders, setCorrectOrders] = useState<OrderProps[]>([]);
  const [status, setStatus] = useState(statusMap.PENDING);
  const [statusColor, setStatusColor] = useState(statusColorMap.PENDING);
  const [selectedMed, setSelectedMed] = useState<OralGlpDosageMatrix | null>(
    null
  );
  const [seeMore, setSeeMore] = useState(
    !Router.asPath.includes('patient-portal')
  );

  const [openReactivation, setOpenReactivation] = useState(false);
  const [openUpdatePayment, setOpenUpdatePayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<any>(null);

  let medName = correctOrders?.[0]?.prescription_id?.medication;

  function getZealthyWeightLossSubStatus(subscriptions: any) {
    const zealthyWeightLossSub = subscriptions.find((subscription: any) => {
      return subscription.subscription.name === 'Zealthy Weight Loss';
    });

    if (!zealthyWeightLossSub) {
      return null;
    }

    return zealthyWeightLossSub;
  }

  const zealthyWeightLossSub = getZealthyWeightLossSubStatus(subscriptions);

  const { data: orders } = usePatientOrders();
  const unsentOrders = orders?.filter(o => !o?.order_status?.includes('SENT'));

  const refillStartDate = useMemo(() => {
    const order = correctOrders?.[0];
    const duration = order?.prescription_id?.duration_in_days || 0;
    const refillStartDate = addDays(
      new Date(order?.created_at ?? ''),
      duration
    );
    return refillStartDate;
  }, [correctOrders]);

  const handleReactivation = useCallback(async () => {
    setLoading(true);
    try {
      let updatedZealthySubscription = null;

      // Reactivate or renew the Zealthy Weight Loss subscription if not active
      if (zealthyWeightLossSub.status !== 'active') {
        const isZealthySubscriptionScheduledForCancellation =
          zealthyWeightLossSub.status === 'scheduled_for_cancelation';

        updatedZealthySubscription =
          isZealthySubscriptionScheduledForCancellation
            ? await reactivatePrescription.mutateAsync(
                zealthyWeightLossSub.reference_id || ''
              )
            : await renewPrescription.mutateAsync(zealthyWeightLossSub || '');
      }

      if (refetchSubs) {
        refetchSubs();
      }

      const isZealthySubscriptionActive = updatedZealthySubscription
        ? ['trialing', 'active'].includes(updatedZealthySubscription.status)
        : true;

      if (isZealthySubscriptionActive) {
        setOpenReactivation(false);
      } else {
        setOpenReactivation(false);
        setOpenUpdatePayment(true);
      }
    } catch (error) {
      console.error('Error during reactivation:', error);
    } finally {
      setLoading(false);
    }
  }, [
    reactivatePrescription,
    renewPrescription,
    refetchSubs,
    recurringWeightLossPrescription?.reference_id,
    zealthyWeightLossSub,
  ]);

  useEffect(() => {
    if (order) {
      const results: OrderProps[] = [];
      const sortedOrders = order?.sort((a, b) => b?.id - a?.id);

      if (sortedOrders.length === 1) {
        results.push(...sortedOrders);
      } else if (sortedOrders.find(g => g.tracking_number)) {
        let indexToMove = sortedOrders.findIndex(
          item => item.tracking_number !== null
        );

        if (indexToMove !== -1) {
          // Remove the object from its current position
          let movedObject = sortedOrders.splice(indexToMove, 1)[0];

          // Insert the object at index 0
          sortedOrders.unshift(movedObject);
          results.push(...sortedOrders);
        }
      } else {
        results.push(...sortedOrders.sort((a, b) => a?.id - b?.id));
      }

      let status = getOrderStatus(results[0]) || statusMap.PENDING;
      const pharmacy = results[0]?.prescription_id?.pharmacy?.toLowerCase();

      setStatus(status);
      const statusColor = statusColorMap?.[status] || statusColorMap.Shipped;
      setStatusColor(statusColor);
      setCorrectOrders([...results]);
    }
  }, [order]);

  useEffect(() => {
    // Get all elements with class "subtitle"
    const subtitleElements = document.querySelectorAll('.subtitle');

    // Apply styles to each element
    subtitleElements.forEach(function (element: any) {
      element.style.color = '#989898';
      element.style.fontFamily = 'Inter';
      element.style.fontSize = '0.625rem';
      element.style.fontStyle = 'normal';
      element.style.fontWeight = '700';
      element.style.lineHeight = '1.25rem';
      element.style.letterSpacing = '-0.00375rem';
    });
  });

  async function fetchCorrectMed() {
    if (correctOrders.length > 0) {
      const prescriptionRequest = await supabase
        .from('prescription_request')
        .select('oral_matrix_id')
        .eq('id', (correctOrders[0]?.prescription_request_id as any)?.id)
        .single()
        .then(({ data }) => data);
      console.log('prescriptionRequestID', prescriptionRequest);
      const oralMatrixData = await supabase
        .from('oral_dosage_matrix')
        .select('*')
        .eq('id', prescriptionRequest?.oral_matrix_id!)
        .single()
        .then(({ data }) => data);

      setSelectedMed(oralMatrixData);
    }
  }

  useEffect(() => {
    if (correctOrders?.length) {
      fetchCorrectMed();
    }
  }, [correctOrders?.length]);

  if (medName) {
    medName = medName?.charAt(0).toUpperCase() + medName?.slice(1);
    medName = medNameFilter(medName);
  }

  const routerHandler = () => {
    if (isBundle) {
      Router.push(Pathnames.WL_BUNDLE_REORDER);
    }
    if (
      isBundle &&
      ['BUNDLED_REFILL_2', 'BUNDLED_REFILL_3']?.includes(
        correctOrders?.[0]?.order_status || ''
      )
    ) {
      Router.push(Pathnames.WL_QUARTERLY_CHECKIN);
    }
  };

  const activePrescriptionRequest = prescriptionRequest?.some(prescription =>
    ['REQUESTED', 'REQUESTED-FORWARDED', 'PRE_INTAKES'].includes(
      prescription?.status || ''
    )
  );

  const sortedOrderOldestToNewest = correctOrders?.sort(
    (a, b) => a?.id - b?.id
  );

  const medicationName = recurringWeightLossPrescription?.order?.total_dose
    ?.split(' ')?.[0]
    ?.toLowerCase();

  const getTrackingInformation = async () => {
    try {
      setLoading(true);
      const trackingInformation = await axios.post(
        `/api/service/shipping/tracking-details`,
        { trackingNumber: correctOrders?.[0]?.tracking_number }
      );
      setTrackingInfo(trackingInformation?.data?.orderTracker?.trackers?.[0]);
      setLoading(false);
    } catch (error) {
      setLoading(true);
      console.log('Error fetching tracking information', error);
    }
  };

  useEffect(() => {
    setTrackingInfo(null);

    if (correctOrders?.[0]?.tracking_number) {
      getTrackingInformation();
    }
  }, [correctOrders?.[0]?.tracking_number]);

  return selectedMed &&
    !correctOrders?.every(
      o =>
        o.order_status?.toLowerCase()?.includes('cancel') &&
        recurringWeightLossPrescription?.order_id !== o.id
    ) ? (
    <>
      <Card
        sx={{
          width: '100%',
          marginBottom: '1rem',
          borderRadius: '1rem',
          position: 'relative',
          height: seeMore ? '100%' : '600px',
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            '& p': {
              margin: '3px 0',
            },
          }}
        >
          {!Router.asPath.includes('/patient-portal') ? (
            <Box
              sx={{
                background: statusColor,
                height: '26px',
                borderRadius: '12px',
                padding: '5px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Typography
                component="p"
                variant="subtitle1"
                sx={{
                  fontSize: '0.6875rem !important',
                  fontWeight: '500',
                }}
              >
                Order Date{' '}
                <b>
                  {format(
                    new Date(correctOrders?.[0].created_at || ''),
                    'MMM do, yyyy'
                  )}
                </b>
              </Typography>
              {differenceInDays(
                new Date(),
                new Date(correctOrders?.[0]?.created_at || '')
              ) > 21 && !activePrescriptionRequest ? (
                <Button
                  variant="text"
                  sx={{
                    fontSize: '0.6875rem !important',
                    fontWeight: '500',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                      backgroundColor: 'transparent',
                    },
                    '&:active': {
                      backgroundColor: 'transparent',
                    },
                  }}
                  onClick={() =>
                    isBundle
                      ? routerHandler()
                      : Router.push(
                          '/patient-portal/visit/weight-loss-compound-refill'
                        )
                  }
                >
                  Refill?
                </Button>
              ) : null}
            </Box>
          ) : null}
          <Stack sx={{ gap: isMobile ? '0.1rem' : '0.2rem' }}>
            <Box
              sx={{
                position: 'relative',
                backgroundColor: medName?.toLowerCase().includes('semaglutide')
                  ? '#F7F9A5'
                  : '#D9E8FF',
                borderRadius: '0.375rem',
              }}
            >
              {medName && isWeightLossMed(medName) ? (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                  }}
                >
                  <AddToCalendarButton
                    name="Submit your Zealthy request today"
                    startDate={format(refillStartDate, 'yyyy-MM-dd').toString()}
                    location="World Wide Web"
                    description="[url]https://app.getzealthy.com/patient-portal/questionnaires-v2/weight-loss-compound-refill[/url]"
                    options="'Apple','Google','Microsoft365'"
                    size="1"
                    hideBackground
                    hideCheckmark
                    label="Add Refill Reminder"
                    styleLight={`--btn-background: ${theme.palette.primary.light}; --btn-text: #fff;`}
                    lightMode="bodyScheme"
                    trigger="click"
                  />
                </Box>
              ) : null}
              <Typography
                variant="h3"
                fontSize="1.25rem"
                sx={{
                  position: 'absolute',
                  left: '1rem',
                  bottom: '80px',
                  width: '40%',
                }}
              >
                {medName?.split(' ').slice(0, 2).join(' ')}
              </Typography>
              {!isBundle &&
              ![297, 449, 600].includes(correctOrders?.[0]?.total_price || 0) &&
              !Router.asPath.includes('patient-portal') &&
              (correctOrders?.[0]?.total_price || selectedMed?.price) ? (
                <Typography
                  variant="h2"
                  sx={{
                    position: 'absolute',
                    left: '1rem',
                    bottom: '50px',
                  }}
                >
                  {`$${correctOrders?.[0]?.total_price || selectedMed?.price}`}
                </Typography>
              ) : null}
              <CardMedia
                component="img"
                height="194"
                src={
                  'https://api.getzealthy.com/storage/v1/object/public/images/programs/oral_semaglutide.svg'
                }
                alt="Compound Bottle"
                sx={{
                  objectFit: 'none',
                  marginLeft: isMobile ? '45px' : '0px',
                  marginTop: '24px',
                }}
              />
            </Box>
            {(Router.asPath.includes('order-history') ||
              Router.asPath.includes('/patient-portal')) &&
              correctOrders?.[0]?.tracking_number &&
              zealthyWeightLossSub?.status.includes('active') &&
              !isBundled && (
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    fontWeight: '600',
                    fontSize: '1.25rem',
                    marginTop: '1rem',
                  }}
                  onClick={() =>
                    Router.push(
                      '/patient-portal/questionnaires-v2/weight-loss-compound-refill'
                    )
                  }
                >
                  Get Now
                </Button>
              )}
            {(Router.asPath.includes('order-history') ||
              Router.asPath.includes('/patient-portal')) &&
              correctOrders?.[0]?.tracking_number &&
              zealthyWeightLossSub?.status.includes('cancel') &&
              !isBundled && (
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    fontWeight: '600',
                    fontSize: '1.25rem',
                    marginTop: '1rem',
                  }}
                  onClick={() => Router.push(Pathnames.WL_NONBUNDLED_TREATMENT)}
                >
                  Get Now
                </Button>
              )}
            <OrderTracker
              key={`order-${correctOrders?.[0].id}`}
              order={correctOrders?.[0]}
              isFailedPayment={correctOrders?.some(
                o => o.order_status === 'PAYMENT_FAILED'
              )}
              subscriptions={subscriptions}
              isCompoundCard={true}
            />
          </Stack>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              flexBasis: 'calc(50% - 1rem)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography component="h4" variant="body1" fontWeight={700}>
                  TRACKING NUMBER
                </Typography>
                {correctOrders?.[0]?.tracking_number ? (
                  <Link
                    target="_blank"
                    href={
                      'https://www.google.com/search?q=' +
                      correctOrders?.[0]?.tracking_number
                    }
                  >
                    {correctOrders?.[0]?.tracking_number}
                  </Link>
                ) : (
                  <Typography component="div" variant="body1">
                    Pending
                  </Typography>
                )}
              </Box>
              {correctOrders?.[0]?.tracking_number &&
              correctOrders?.[0]?.shipment_details?.toLowerCase() !==
                'delivered' &&
              trackingInfo !== undefined ? (
                <Box
                  sx={{ display: 'flex', cursor: 'pointer' }}
                  onClick={() =>
                    Router.push(
                      `/patient-portal/order-tracker/${correctOrders?.[0]?.tracking_number}`
                    )
                  }
                >
                  <Typography
                    component="div"
                    variant="body1"
                    sx={{ color: '#00531B' }}
                  >
                    See details of your order
                  </Typography>
                  <Icon sx={{ color: '#00531B' }}>
                    <KeyboardArrowRightIcon />
                  </Icon>
                </Box>
              ) : null}
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              justifyContent: 'space-between',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                width: '100%',
              }}
            >
              <>
                <Typography component="h4" variant="body1" fontWeight={700}>
                  DOSAGE
                </Typography>
                <Typography
                  dangerouslySetInnerHTML={{
                    __html: selectedMed.dosage_instructions!,
                  }}
                />
              </>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  flexBasis: 'calc(50% - 1rem)',
                }}
              >
                <Typography component="h4" variant="body1" fontWeight={700}>
                  DURATION
                </Typography>
                <Typography>{selectedMed?.duration_in_days} days</Typography>
              </Box>
            </Box>
          </Box>
          {/* </Box> */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              flexBasis: 'calc(50% - 1rem)',
            }}
          >
            <Typography sx={{ marginBottom: '16px !important' }}>
              Do not increase your dosage without consulting your provider.
            </Typography>
            {unsentOrders?.length && (
              <Typography sx={{ marginBottom: '16px !important' }}>
                Shipments will come monthly with 1-month supply at a time. You
                have paid for the next {unsentOrders?.length} month
                {unsentOrders?.length === 1 ? '' : 's'} already.
              </Typography>
            )}
            {/* <Typography
              component="p"
              variant="body1"
              sx={{ marginBottom: '1rem !important' }}
            >
              {correctOrders?.length === 1 &&
              selectedMed?.duration_in_days === 30
                ? whatToDoMonthly
                : correctOrders[0]?.prescription_id?.pharmacy === 'Belmar'
                ? whatToDoBelmar
                : whatToDoQuarterly}
            </Typography> */}
          </Box>
        </CardContent>
        <Box sx={{}}>
          <Button
            fullWidth
            variant="text"
            sx={{
              position: seeMore ? 'relative' : 'absolute',
              bottom: 0,
              background: '#EBEBEB',
              width: '100%',
            }}
            onClick={() => setSeeMore(o => !o)}
          >
            {seeMore ? 'Less' : 'More'}
          </Button>
        </Box>
      </Card>
      <StandardModal
        modalOpen={openReactivation}
        setModalOpen={() => setOpenReactivation(o => !o)}
      >
        <Box
          sx={{
            padding: '12px',
            marginTop: '2rem',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h3"
            mb="1rem"
          >{`Confirm that you want to re-activate to have your ${medicationName} shipped to you. `}</Typography>
          <Typography mb="1rem">{`Your next shipment of ${medicationName} will be shipped within 3-5 business days and you will continue to receive your medication every ${recurringWeightLossPrescription?.interval_count} days.`}</Typography>
          {zealthyWeightLossSub?.status !== 'active' && (
            <Typography mb="1rem">{`[This will re-activate your weight loss membership as well if your membership is currently not active, as you must have an active weight loss membership to order medication since you must under the care of our medical team.]`}</Typography>
          )}
          <Typography>{`Price: $${recurringWeightLossPrescription?.price}`}</Typography>
          <Typography>{`Dosage: ${recurringWeightLossPrescription?.order?.total_dose}`}</Typography>
          <Typography mb="3rem">{`Frequency: ${selectedMed.duration_in_days}`}</Typography>
          <LoadingButton
            fullWidth
            disabled={loading}
            onClick={handleReactivation}
          >
            Confirm and re-activate
          </LoadingButton>
        </Box>
      </StandardModal>
      <StandardModal
        modalOpen={openUpdatePayment}
        setModalOpen={() => setOpenUpdatePayment(o => !o)}
      >
        <UpdatePayment
          patientId={recurringWeightLossPrescription?.patient_id}
          stripeCustomerId={recurringWeightLossPrescription?.reference_id}
          goHome={() => setOpenUpdatePayment(false)}
        />
      </StandardModal>
    </>
  ) : null;
};

export default OrderOralCompoundCard;
