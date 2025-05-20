import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { OrderProps } from '../OrderHistoryContent';
import medNameFilter from '@/utils/medicationNameFilter';
import {
  CompoundMatrixProps,
  PatientSubscriptionProps,
  useAllPatientPrescriptionRequest,
  usePharmacyTurnAroundTimeSingle,
  useIsBundled,
} from '@/components/hooks/data';
import Router from 'next/router';
import { addDays, differenceInDays, format } from 'date-fns';
import Link from 'next/link';
import OrderTracker from '../../PatientPortal/components/OrderTracker';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { Pathnames } from '@/types/pathnames';
import { calculateBelmarVials } from './utils';
import { StandardModal } from '@/components/shared/modals';
import {
  useReactivateSubscription,
  useRenewSubscription,
} from '@/components/hooks/mutations';

import { UpdatePayment } from '@/components/shared/UpdatePatientInfo';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import Loading from '@/components/shared/Loading/Loading';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Icon from '@mui/material/Icon';
import { capitalize } from '@/utils/capitalize';
import axios from 'axios';
import { AddToCalendarButton } from 'add-to-calendar-button-react';
import { isWeightLossMed } from '@/utils/isWeightLossMed';
import { useTheme } from '@mui/system';

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

function removeShortParagraphs(html: string, minLength: number = 5): string {
  return html.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (fullMatch, insideP) => {
    const textContent = insideP.replace(/<[^>]+>/g, '').trim();
    return textContent.length < minLength ? '' : fullMatch;
  });
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

const OrderCompoundCard = ({
  order,
  refetchOrder,
  matrixData,
  subscriptions,
  isBundle,
  recurringWeightLossPrescription,
  refetchSubs,
}: Props) => {
  const { data: prescriptionRequest } = useAllPatientPrescriptionRequest();
  const renewPrescription = useRenewSubscription();
  const { data: isBundled, isLoading: isBundledLoading } = useIsBundled();
  const reactivatePrescription = useReactivateSubscription();
  const isMobile = useIsMobile();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const { data: latestSystematicOrder } = usePharmacyTurnAroundTimeSingle(
    order[0]?.prescription_id?.pharmacy! as
      | 'Belmar'
      | 'Empower'
      | 'GoGoMeds'
      | 'Hallandale'
      | 'Revive'
      | 'Tailor-Made'
  );

  const theme = useTheme();

  const turnAroundTime = differenceInDays(
    new Date(),
    new Date(latestSystematicOrder || '')
  );

  const [correctOrders, setCorrectOrders] = useState<OrderProps[]>([]);
  const [status, setStatus] = useState(statusMap.PENDING);
  const [statusColor, setStatusColor] = useState(statusColorMap.PENDING);
  const [selectedMed, setSelectedMed] = useState<CompoundMatrixProps | null>(
    null
  );
  const [wasExpanded, setWasExpanded] = useState(false);
  const [seeMore, setSeeMore] = useState(false);

  const handleSeeMoreToggle = () => {
    setSeeMore(prev => {
      const nextState = !prev;
      if (
        !nextState &&
        wasExpanded &&
        Router.asPath.includes('order-history')
      ) {
        setTimeout(() => {
          if (cardRef.current) {
            const yOffset = isMobile ? -150 : -190;
            const yPosition =
              cardRef.current.getBoundingClientRect().top +
              window.scrollY +
              yOffset;
            window.scrollTo({
              top: yPosition,
              behavior: 'smooth',
            });
          }
        }, 200);
      }
      setWasExpanded(true);
      return nextState;
    });
  };

  if (isBundledLoading) {
    <Loading />;
  }
  const [openReactivation, setOpenReactivation] = useState(false);
  const [openUpdatePayment, setOpenUpdatePayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<any>(null);

  let medName = correctOrders?.[0]?.prescription_id?.medication;
  const isHallandale120 =
    correctOrders[0]?.total_dose === 'Tirzepatide 120 mg vial' &&
    correctOrders[0]?.prescription_id?.pharmacy === 'Hallandale';

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
      if (pharmacy?.includes('red rock')) {
        status = statusMap.PENDING;
      }
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

  function fetchCorrectMed() {
    const medication = correctOrders?.[0]?.prescription_id?.medication
      ?.split(' ')[0]
      ?.toLowerCase();
    const dosage =
      correctOrders?.[0]?.total_dose ===
        correctOrders?.[0]?.prescription_id?.medication ||
      correctOrders?.[0]?.total_dose
        ? `${correctOrders?.[0]?.total_dose?.split(' ')[1]} mg`
        : `${
            correctOrders?.[0]?.prescription_id?.medication?.split(' ')[1]
          } mg`;

    const foundMed = matrixData?.find(
      entry => entry.id === correctOrders[0].prescription_id?.matrix_id
    );
    setSelectedMed(foundMed as CompoundMatrixProps);
  }

  useEffect(() => {
    if (matrixData?.length && correctOrders?.length) {
      fetchCorrectMed();
    }
  }, [matrixData, correctOrders?.length]);

  useEffect(() => {
    // Get all elements with class "subtitle"
    const subtitleElements = document.querySelectorAll('.subtitle');

    // Apply styles to each element
    subtitleElements.forEach(function (element: any) {
      element.style.color = '#989898';
      element.style.fontFamily = 'Inter';
      element.style.fontSize = '0.8rem';
      element.style.fontStyle = 'normal';
      element.style.fontWeight = '700';
      element.style.lineHeight = '1.25rem';
      element.style.letterSpacing = '-0.00375rem';
    });
  });

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

  if (medName) {
    medName = medName?.charAt(0).toUpperCase() + medName?.slice(1);
    medName = medNameFilter(medName);
  }

  const activePrescriptionRequest = prescriptionRequest?.some(prescription =>
    ['REQUESTED', 'REQUESTED-FORWARDED', 'PRE_INTAKES'].includes(
      prescription?.status || ''
    )
  );

  const sortedOrderOldestToNewest = correctOrders?.sort(
    (a, b) => a?.id - b?.id
  );

  const hasOneVialForMultipleMonths = !!(
    Math.floor((selectedMed?.duration_in_days || 30) / 30) !==
      (selectedMed?.number_of_vials || 1) &&
    selectedMed?.subscription_plan?.includes('multi_month')
  );

  const whatToDoMonthly = `${sortedOrderOldestToNewest[0]?.prescription_id?.dosage_instructions}. Do not increase your dosage without consulting your provider. `;

  // const whatToDoQuarterly = calculateWhatToDoQuarterly(
  //   hasOneVialForMultipleMonths,
  //   selectedMed?.number_of_vials || 1,
  //   descriptionByVial,
  //   sortedOrderOldestToNewest
  // );

  const whatToDoBelmar = `${
    sortedOrderOldestToNewest[0]?.prescription_id?.dosage_instructions
  } once per week x 4 weeks under the skin, ${
    calculateBelmarVials(correctOrders[0]?.total_dose || '')?.[0]
  }. Then, you will ${sortedOrderOldestToNewest[1]?.prescription_id?.dosage_instructions?.toLowerCase()} under the skin, ${
    calculateBelmarVials(correctOrders[0]?.total_dose || '')?.[1]
  }. Finally, you will ${sortedOrderOldestToNewest[2]?.prescription_id?.dosage_instructions?.toLowerCase()} under the skin, ${
    calculateBelmarVials(correctOrders[0]?.total_dose || '')?.[2]
  }. Your 3 month supply will come in 3 shipments with each shipment containing a 4 week supply of medications.`;

  const belmarOrders: OrderProps[] = [];

  correctOrders[0]?.prescription_id?.pharmacy === 'Belmar'
    ? correctOrders?.map((order, idx) => {
        if (
          ['2', '10'].includes(
            order?.prescription_id?.medication?.split(' ')[1] || ''
          )
        ) {
          belmarOrders.push(...[order, order]);
        } else {
          belmarOrders.push(order);
        }
      })
    : [];

  const medicationName = recurringWeightLossPrescription?.order?.total_dose
    ?.split(' ')?.[0]
    ?.toLowerCase();

  console.log('Selected Med:', selectedMed);

  const frequency = useMemo(() => {
    if (!recurringWeightLossPrescription) return '';

    if (recurringWeightLossPrescription.interval_count === 1) {
      return `${capitalize(recurringWeightLossPrescription?.interval)}ly`;
    }

    return `Every ${recurringWeightLossPrescription?.interval_count} ${recurringWeightLossPrescription?.interval}`;
  }, [recurringWeightLossPrescription]);
  console.log(
    'recurringWeightLossPrescription',
    recurringWeightLossPrescription
  );

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
        ref={cardRef}
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
                }}
              >
                {medName?.split(' ')[0]}
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
                image={
                  medName?.toLowerCase().includes('semaglutide')
                    ? '/images/semaglutide_bottle.png'
                    : '/images/tirzepatide_bottle.png'
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
              correctOrders[0].tracking_number &&
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
                    Router.push('/patient-portal/visit/weight-loss-refill')
                  }
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
                    __html: selectedMed.dose!.replace('---BREAK---', ''),
                  }}
                />
              </>
            </Box>
            {selectedMed?.vial_label && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                }}
              >
                <Typography
                  dangerouslySetInnerHTML={{
                    __html: removeShortParagraphs(selectedMed.vial_label),
                  }}
                />
              </Box>
            )}

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
            <Typography
              dangerouslySetInnerHTML={{
                __html: selectedMed.laymans_instructions!,
              }}
            />
            <Typography sx={{ marginBottom: '16px !important' }}>
              Do not increase your dosage without consulting your provider.
            </Typography>
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
            onClick={handleSeeMoreToggle}
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
          <Typography mb="3rem">{`Frequency: ${frequency}`}</Typography>
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

export default OrderCompoundCard;
