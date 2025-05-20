import { Box, Card, CardContent, Typography } from '@mui/material';
import { Database } from '@/lib/database.types';
import { useEffect, useMemo, useState } from 'react';
import { OrderProps } from '../OrderHistoryContent';
import Link from 'next/link';
import medNameFilter from '@/utils/medicationNameFilter';
import { formattedPharmacy } from '@/utils/parsePrescriptionPharmacy';
import { addDays, format } from 'date-fns';
import { AddToCalendarButton } from 'add-to-calendar-button-react';
import { useTheme } from '@mui/system';
import { isWeightLossMed } from '@/utils/isWeightLossMed';
import { usePathname } from 'next/navigation';

type Address = Database['public']['Tables']['address']['Row'];

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
  order: OrderProps;
  patientAddress: Address | null;
  refetchOrder: () => void;
  pharmacyAddress?: any;
  subscriptions?: any;
}

const OrderCard = ({
  order,
  patientAddress,
  refetchOrder,
  pharmacyAddress,
  subscriptions,
}: Props) => {
  const [status, setStatus] = useState(statusMap.PENDING);
  const [statusColor, setStatusColor] = useState(statusColorMap.PENDING);

  const theme = useTheme();

  const refillStartDate = useMemo(() => {
    const duration = order.prescription_id?.duration_in_days || 0;
    const refillStartDate = addDays(new Date(order.created_at ?? ''), duration);
    return refillStartDate;
  }, [order.created_at, order.prescription_id?.duration_in_days]);

  useEffect(() => {
    if (order) {
      let status = getOrderStatus(order);
      const pharmacy = order?.prescription_id?.pharmacy?.toLowerCase();
      if (pharmacy?.includes('red rock')) {
        status = statusMap.PENDING;
      }
      setStatus(status);
      const statusColor = statusColorMap?.[status] || statusColorMap?.Shipped;
      setStatusColor(statusColor);
    }
  }, [order]);

  let medName = order?.prescription_id?.medication;

  useEffect(() => {
    if (order) {
      let status = getOrderStatus(order);
      const pharmacy = order?.prescription_id?.pharmacy?.toLowerCase();
      if (pharmacy?.includes('red rock')) {
        status = statusMap.PENDING;
      }
      setStatus(status);
      const statusColor = statusColorMap?.[status] || statusColorMap.Shipped;
      setStatusColor(statusColor);
    }
  }, [order]);

  const pathName = usePathname();

  if (medName) {
    medName = medName?.charAt(0).toUpperCase() + medName?.slice(1);
    medName = medNameFilter(medName);
  }
  if (medName?.toLowerCase().includes('naltrexone')) {
    medName = 'Bupropion HCL SR 150 MG Tablet + Naltrexone HCL 5 MG Capsule';
  }
  if (
    order?.order_status === 'BUNDLED_REFILL_2' ||
    order?.order_status === 'BUNDLED_REFILL_3' ||
    order?.order_status === 'ORDER_PENDING_ACTION' ||
    order?.order_status === 'ORDER_PENDING_REACTIVATION'
  )
    return null;

  const brandNameCheck = () => {
    if (
      order?.prescription_id?.medication
        ?.split(' ')[0]
        .toLowerCase()
        .includes('wegovy')
    ) {
      return true;
    }
    if (
      order?.prescription_id?.medication
        ?.split(' ')[0]
        .toLowerCase()
        .includes('ozempic')
    ) {
      return true;
    }
    if (
      order?.prescription_id?.medication
        ?.split(' ')[0]
        .toLowerCase()
        .includes('mounjaro')
    ) {
      return true;
    }
    if (
      order?.prescription_id?.medication
        ?.split(' ')[0]
        .toLowerCase()
        .includes('zepbound')
    ) {
      return true;
    }
    if (
      order?.prescription_id?.medication
        ?.split(' ')[0]
        .toLowerCase()
        .includes('saxenda')
    ) {
      return true;
    }
    return false;
  };

  const isBrandNameGlp = brandNameCheck();

  return !order?.order_status?.toUpperCase()?.includes('CANCELED') ? (
    <Card
      sx={{
        width: '100%',
        marginBottom: '1rem',
        borderRadius: '1rem',
        overflow: 'visible',
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <>
          {pathName !== '/patient-portal' && (
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
                variant="body2"
                sx={{
                  fontSize: '11px !important',
                  fontWeight: '500',
                }}
              >
                {status}
              </Typography>
            </Box>
          )}
          <Typography
            component="h3"
            variant="h3"
            sx={{ color: '#1B1B1B', fontWeight: '500' }}
          >
            {medName}
          </Typography>
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
              Created at
            </Typography>
            <Typography>
              {format(new Date(order?.created_at || ''), 'MMMM do, yyyy')}
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
              Dosage instructions:
            </Typography>
            <Typography>
              {order?.prescription_id?.dosage_instructions}
            </Typography>
          </Box>
          {order?.order_status ===
          'SENT_TO_HALLANDALE' ? null : isBrandNameGlp ? null : (
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
                Tracking Number
              </Typography>
              {order?.tracking_number ? (
                <Link
                  target="_blank"
                  href={
                    'https://www.google.com/search?q=' + order?.tracking_number
                  }
                >
                  {order?.tracking_number}
                </Link>
              ) : (
                <Typography component="div" variant="body1">
                  Pending
                </Typography>
              )}
            </Box>
          )}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {!isBrandNameGlp &&
            (order?.prescription_id?.pharmacy?.toLowerCase().includes('gogo') ||
              order?.prescription_id?.pharmacy
                ?.toLowerCase()
                .includes('tailor-made') ||
              order?.prescription_id?.pharmacy
                ?.toLowerCase()
                .includes('hallandale') ||
              order?.prescription_id?.pharmacy
                ?.toLowerCase()
                .includes('empower') ||
              order?.prescription_id?.pharmacy
                ?.toLowerCase()
                .includes('red rock')) ? (
              <>
                <Typography
                  component="h4"
                  variant="body1"
                  sx={{ color: '#989898' }}
                >
                  Delivery Address
                </Typography>
                <Typography>{patientAddress?.address_line_1}</Typography>
                <Typography>{patientAddress?.address_line_2}</Typography>
                <Typography>
                  {patientAddress?.city}, {patientAddress?.state}
                </Typography>
                <Typography>{patientAddress?.zip_code}</Typography>
                <Typography>United States</Typography>
              </>
            ) : isBrandNameGlp ? (
              <>
                <Typography
                  component="h4"
                  variant="body1"
                  sx={{ color: '#989898' }}
                >
                  Pharmacy Address
                </Typography>
                <Typography>
                  {pharmacyAddress?.pharmacy?.split(' ')?.[0]}{' '}
                  {pharmacyAddress?.pharmacy?.split(' ')?.[1]}{' '}
                  {pharmacyAddress?.pharmacy?.split(' ')?.[2]}
                </Typography>
                <Typography>
                  {pharmacyAddress?.pharmacy?.split(' ')?.[3]}{' '}
                  {pharmacyAddress?.pharmacy?.split(' ')?.[4]}{' '}
                  {pharmacyAddress?.pharmacy?.split(' ')?.[5]}
                </Typography>
                <Typography>
                  {pharmacyAddress?.pharmacy?.split(' ')?.[6]?.split(',')}
                </Typography>
                <Typography>United States</Typography>
              </>
            ) : (
              <>
                {formattedPharmacy(order?.prescription_id?.pharmacy) && (
                  <>
                    <Typography
                      component="h4"
                      variant="body1"
                      sx={{ color: '#989898' }}
                    >
                      Pharmacy Address
                    </Typography>
                    {formattedPharmacy(order?.prescription_id?.pharmacy)}
                  </>
                )}
              </>
            )}
          </Box>
          {(order?.prescription_id?.pharmacy?.toLowerCase().includes('gogo') ||
            order?.prescription_id?.pharmacy
              ?.toLowerCase()
              .includes('tailor-made') ||
            order?.prescription_id?.pharmacy
              ?.toLowerCase()
              .includes('hallandale') ||
            order?.prescription_id?.pharmacy
              ?.toLowerCase()
              .includes('empower')) && (
            <>
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
                  Total
                </Typography>
                <Typography>
                  {order?.total_price ? `$${order?.total_price}.00` : '-'}
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
                  Amount Paid
                </Typography>
                <Typography>
                  {order?.amount_paid ? `$${order?.amount_paid}.00` : '-'}
                </Typography>
              </Box>
            </>
          )}

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
              Order Number
            </Typography>
            <Typography>{order?.id ? order?.id : '-'}</Typography>

            {medName && isWeightLossMed(medName) ? (
              <AddToCalendarButton
                name="Submit your Zealthy request today"
                startDate={format(refillStartDate, 'yyyy-MM-dd')}
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
            ) : null}
          </Box>
        </>
      </CardContent>
    </Card>
  ) : null;
};

export default OrderCard;
