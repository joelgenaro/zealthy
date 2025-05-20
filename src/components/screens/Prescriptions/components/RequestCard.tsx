import { useEffect, useState } from 'react';
import { Database } from '@/lib/database.types';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { format } from 'date-fns';

type Address = Database['public']['Tables']['address']['Row'];

enum statusMap {
  ASSIGNED = 'In progress',
  PAYMENT_SUCCESS = 'Paid and pending shipping',
  PA_APPROVED = 'Prior Auth Approved',
  PA_DENIED = 'Prior Auth Denied',
  PENDING_INSURANCE = 'Awaiting insurance approval',
  ERROR = 'Request denied by medical provider',
  MEDICAL_ERROR = 'Requires additional medical details',
  INSURANCE_ERROR = 'Must upload insurance details',
  PENDING = 'Outstanding medical visit',
  PAYMENT_FAILED = 'Payment method unsuccessful',
}

const statusColorMap: { [key: string]: string } = {
  'In progress': '#F4F7F1',
  'Outstanding medical visit': '#FFF4CD',
  'Awaiting insurance approval': '#FFF4CD',
  'Requires additional medical details': '#FFEAE3',
  'Must upload insurance details': '#FFEAE3',
  'Request denied by medical provider': '#FFEAE3',
};

function getRequestStatus(request: any) {
  let status = statusMap.PENDING;
  const orderStatus = request.status;
  switch (orderStatus) {
    case 'REQUESTED':
      status = statusMap.PENDING;
      break;
    case 'REQUESTED-FORWARDED':
      status = statusMap.PENDING;
      break;
    case 'Initiate Prior Auth':
      status = statusMap.PENDING_INSURANCE;
      break;
    case 'Pending Insurance Information':
      status = statusMap.INSURANCE_ERROR;
      break;
    case 'ASSIGNED':
      status = statusMap.ASSIGNED;
      break;
    case 'Pending Medical Information':
      status = statusMap.MEDICAL_ERROR;
      break;
    case 'REJECTED':
      // if the patient has been rejected twice
      status = statusMap.ERROR;
      break;
    // need to find where the coupon is created, neeeds to be triggered on two 'rejected'
    case 'SENT_TO_TAILOR_MADE':
      status = statusMap.PAYMENT_SUCCESS;
      break;
    case 'SENT_TO_TAILOR-MADE':
      status = statusMap.PAYMENT_SUCCESS;
      break;
    case 'SENT_TO_EMPOWER':
      status = statusMap.PAYMENT_SUCCESS;
      break;
    case 'SENT_TO_HALLANDALE':
      status = statusMap.PAYMENT_SUCCESS;
      break;
    case 'SENT_TO_RED_ROCK':
      status = statusMap.PAYMENT_SUCCESS;
      break;
    case 'SENT_TO_NON_INTEGRATED_PHARMACY':
      status = statusMap.ASSIGNED;
      break;
    case 'PAYMENT_SUCCESS':
      status = statusMap.ASSIGNED;
      break;
    case 'PAYMENT_FAILED':
      status = statusMap.PAYMENT_FAILED;
      break;
    case 'PA_APPROVED':
      status = statusMap.PA_APPROVED;
      break;
    case 'PA_DENIED':
      status = statusMap.PA_DENIED;
      break;
    case 'ERROR':
      status = statusMap.ERROR;
      break;
    case 'PENDING':
      status = statusMap.PENDING;
      break;
    default:
      status = orderStatus;
      break;
  }
  return status;
}

interface Props {
  request: any;
  patientAddress?: Address | null;
  isBundle: boolean;
}

const RequestCard = ({ request, patientAddress, isBundle }: Props) => {
  const [status, setStatus] = useState(statusMap.PENDING);
  const [statusColor, setStatusColor] = useState(statusColorMap.PENDING);

  useEffect(() => {
    if (request) {
      const status = getRequestStatus(request);
      setStatus(status);
      const statusColor =
        statusColorMap?.[status] || statusColorMap['Outstanding medical visit'];
      setStatusColor(statusColor);
    }
  }, [request]);

  let medName =
    request?.medication_quantity?.medication_dosage?.medication?.name;

  const medIdentifier = medName;

  if (medName === 'GLP1 Medication') {
    medName = request?.specific_medication || medName;
  }

  if (medName === 'Non-GLP1 Medication') {
    medName = request?.specific_medication || medName;
  }

  if (medName?.toLowerCase().includes('blisovi')) {
    medName = 'birth control';
  }

  medName = `Your ${
    medName || 'medication'
  } prescription request has been submitted`;

  return (
    <Card
      key={request.id}
      sx={{
        width: '100%',
        marginBottom: '1rem',
        borderRadius: '1rem',
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {['Initiate Prior Auth', 'PENDING_INSURANCE'].includes(
          request?.status
        ) ? null : (
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
              {isBundle &&
              [
                'Initiate Prior Auth',
                'Pending Insurance Information',
                'Pending Medical Information',
              ]?.includes(status)
                ? 'Pending'
                : status}
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
          <Typography component="h4" variant="body1" sx={{ color: '#989898' }}>
            Created at
          </Typography>
          <Typography>
            {format(new Date(request.created_at || ''), 'MMMM do yyyy')}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <Typography component="h4" variant="body1" sx={{ color: '#989898' }}>
            Tracking Number
          </Typography>
          <Typography>{'Pending'}</Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <Typography component="h4" variant="body1" sx={{ color: '#989898' }}>
            Delivery Address
          </Typography>
          <>
            <Typography>{patientAddress?.address_line_1}</Typography>
            <Typography>{patientAddress?.address_line_2}</Typography>
            <Typography>
              {patientAddress?.city}, {patientAddress?.state}
            </Typography>
            <Typography>{patientAddress?.zip_code}</Typography>
            <Typography>United States</Typography>
          </>
        </Box>

        {!isBundle ? (
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
                {`${
                  medIdentifier === 'Non-GLP1 Medication'
                    ? 'Included in weight loss membership'
                    : request.total_price
                    ? `$${(
                        request.discounted_price || request.total_price
                      ).toFixed(2)}`
                    : 'N/A'
                }`}
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
                {medIdentifier === 'Non-GLP1 Medication'
                  ? 'Included in weight loss membership'
                  : request.status === 'PAYMENT_FAILED'
                  ? 'Payment method unsuccessful'
                  : 'Pending'}
              </Typography>
            </Box>
          </>
        ) : null}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <Typography component="h4" variant="body1" sx={{ color: '#989898' }}>
            Order Number
          </Typography>
          <Typography>{'Pending'}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RequestCard;
