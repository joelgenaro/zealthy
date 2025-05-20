import Router from 'next/router';
import { format, differenceInCalendarDays } from 'date-fns';
import {
  Box,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { Pathnames } from '@/types/pathnames';
import { usePatient, PriorAuth } from '@/components/hooks/data';
import { PriorAuthStatus } from '@/types/priorAuthStatus';
import StatusBar from './StatusBar';
import { ErrorOutlineRounded, InfoOutlined } from '@mui/icons-material';
import { useState } from 'react';
import StoppedStatusBar from './StoppedStatusBar';

const statusMap: { [key: string]: PriorAuthStatus } = {
  'Initiate Prior Auth': PriorAuthStatus.PROCESSING,
  'Pending Medical Information': PriorAuthStatus.PENDING_MEDICAL,
  'Pending Insurance Information': PriorAuthStatus.PENDING_INSURANCE,
  'PA Submitted': PriorAuthStatus.SUBMITTED,
  'PA Approved': PriorAuthStatus.APPROVED,
  'PA Approved - Included in Pharmacy Benefits':
    PriorAuthStatus.APPROVED_WITH_PHARMACY_BENEFITS,
  'PA Denied': PriorAuthStatus.DENIED,
  'PA Prescribed': PriorAuthStatus.APPROVED,
  'PA Cancelled': PriorAuthStatus.CANCELLED,
  'PA Cancelled - Approved': PriorAuthStatus.CANCELLED,
  'PA Cancelled - Initiated': PriorAuthStatus.STOPPED,
  'PA Cancelled - Submitted': PriorAuthStatus.STOPPED,
};

function getStatusTooltip(status: PriorAuthStatus, medication: string) {
  let description = '';
  switch (status) {
    case PriorAuthStatus.PROCESSING:
      description = `Your prior authorization to have your medication covered is being worked on by your Zealthy coordination team. This typically takes 1-3 business days as the team works hard to maximize the chances of getting your Rx covered.`;
      break;
    case PriorAuthStatus.SUBMITTED:
      description = `Your Zealthy coordination team has submitted your prior authorization to have your medication covered to your insurance. We will be following up regularly and expect to hear back in less than 14 days (typically just a few days).`;
      break;
    case PriorAuthStatus.DENIED:
      if (medication.toLowerCase().includes('wegovy')) {
        description = `Your insurance denied our request to have ${medication} covered. However, we can resubmit for another medication, such as Wegovy. In the meantime, you could order semaglutide or tirzepatide, which you can do by selecting “Request semaglutide or tirzepatide” below.`;
      } else {
        description = `Your insurance denied our request to have ${medication} covered. Your best option is to order semaglutide or tirzepatide, which you can do by selecting “Request semaglutide or tirzepatide” below.`;
      }
      break;
  }

  return description;
}

function getStatusHeader(
  status: PriorAuthStatus,
  medication: string,
  dateUpdated?: string,
  dateApproved?: string
) {
  let description = '';
  switch (status) {
    case PriorAuthStatus.PROCESSING:
      description = `Your prior authorization to get your ${medication} covered is being processed`;
      break;
    case PriorAuthStatus.SUBMITTED:
      description = `Your prior authorization to get your ${medication} covered has been submitted to your insurance provider`;
      break;
    case PriorAuthStatus.APPROVED:
      description = `Congratulations! Your prior authorization for ${medication} was approved on ${dateApproved}`;
      break;
    case PriorAuthStatus.APPROVED_WITH_PHARMACY_BENEFITS:
      description = `Congratulations! Your prior authorization for ${medication} was approved on ${dateApproved} since it was included in your pharmacy benefits.`;
      break;
    case PriorAuthStatus.DENIED:
      description = `Your prior authorization for ${medication} was denied on ${dateUpdated}`;
      break;
    case PriorAuthStatus.PENDING_INSURANCE:
      description = `We need additional insurance information to process a prior authorization to get your ${medication} covered`;
      break;
    case PriorAuthStatus.PENDING_MEDICAL:
      description = `We need additional medical information to process a prior authorization to get your ${medication} covered`;
      break;
    case PriorAuthStatus.CANCELLED:
      description = `Your prior authorization for ${medication} was cancelled on ${dateUpdated}`;
      break;
    default:
      description = `Your prior authorization to get your ${medication} covered is being processed`;
      break;
  }

  return description;
}

function getStatusDescription(status: PriorAuthStatus) {
  let description = null;
  switch (status) {
    case PriorAuthStatus.SUBMITTED:
      description =
        'Your request has been submitted to your insurance provider and we should get a response in less than 14 days.';
      break;
  }

  return description;
}

const terminalStatuses = [PriorAuthStatus.APPROVED, PriorAuthStatus.DENIED];

interface Props {
  priorAuth: PriorAuth;
  hasActiveSubscription: boolean;
  daysUntilCancellation: number;
}

const PriorAuthCard = ({
  priorAuth,
  hasActiveSubscription,
  daysUntilCancellation,
}: Props) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { data: patient } = usePatient();
  let status = priorAuth.status
    ? statusMap[priorAuth.status]
    : PriorAuthStatus.PROCESSING;

  const statusDescription = getStatusDescription(status);
  const statusTooltip = getStatusTooltip(
    status,
    priorAuth.rx_submitted || 'medication'
  );

  const daysSinceUpdated = differenceInCalendarDays(
    new Date(),
    new Date(priorAuth?.updated_at || priorAuth?.created_at)
  );

  const cancelledAndNotActive =
    status === PriorAuthStatus.CANCELLED && !hasActiveSubscription;

  if (terminalStatuses.includes(status) && daysSinceUpdated >= 180) {
    return null;
  }

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        background: '#FFFFFF',
        border: '0.5px solid #CCCCCC',
        borderRadius: '16px',
        position: 'relative',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {!hasActiveSubscription && (
        <Box
          sx={{
            width: '100%',
            height: 'auto',
            padding: '12px 15px',
            backgroundColor: '#eeb1a9',
          }}
        >
          <Stack direction="row" alignItems="center" gap={1}>
            <ErrorOutlineRounded fontSize="small" />
            <Typography>{`Your membership ${
              daysUntilCancellation
                ? `expires in ${daysUntilCancellation} days.`
                : 'is currently cancelled.'
            }`}</Typography>
          </Stack>
        </Box>
      )}
      {!!statusTooltip.length && (
        <IconButton
          size="small"
          onMouseOver={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowTooltip(!showTooltip)}
          style={{ position: 'absolute', top: '5px', right: '5px' }}
        >
          <Tooltip
            open={showTooltip}
            placement="bottom-start"
            onClose={() => setShowTooltip(false)}
            TransitionProps={{ timeout: 600 }}
            title={
              <>
                <Typography>{statusTooltip}</Typography>
              </>
            }
            enterTouchDelay={0}
            leaveTouchDelay={5000}
          >
            <InfoOutlined style={{ fontSize: '15px' }} />
          </Tooltip>
        </IconButton>
      )}
      <Stack gap="1.5rem" width="100%" padding="24px">
        {cancelledAndNotActive ? (
          <Typography
            style={{
              fontSize: '20px',
              lineHeight: '25px',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            Your approved <b>prior authorization</b> for{' '}
            {priorAuth.rx_submitted} has been
            <b style={{ color: '#FF5757' }}> cancelled</b>
          </Typography>
        ) : status === PriorAuthStatus.DENIED && !hasActiveSubscription ? (
          <Typography
            style={{
              fontSize: '20px',
              lineHeight: '25px',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            Your pending <b>prior authorization</b> for {priorAuth.rx_submitted}{' '}
            has been <b style={{ color: '#FF5757' }}>denied</b>
          </Typography>
        ) : !hasActiveSubscription ? (
          <Typography
            style={{
              fontSize: '20px',
              lineHeight: '25px',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            Your pending <b>prior authorization</b> for {priorAuth.rx_submitted}{' '}
            has been <b style={{ color: '#FF5757' }}>stopped</b>
          </Typography>
        ) : (
          <Typography
            style={{
              fontSize: '20px',
              fontWeight: 'bold',
              lineHeight: '25px',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            {getStatusHeader(
              status,
              priorAuth.rx_submitted || 'medication',
              format(
                new Date(priorAuth?.updated_at || priorAuth?.created_at),
                'MMMM d, yyyy'
              ),
              format(
                new Date(priorAuth?.date_approved || priorAuth?.created_at),
                'MMMM d, yyyy'
              )
            )}
          </Typography>
        )}

        {cancelledAndNotActive ? (
          <Typography>
            Your prior authorization to have your insurance cover your{' '}
            {priorAuth.rx_submitted}, which was approved, has been cancelled. It
            will be reactivated if you <b>reactivate your membership</b>.
            <br /> <br />
            This is because we must be able to safely monitor your care, which
            we can only do if you have an active weight loss membership.
          </Typography>
        ) : !hasActiveSubscription ? (
          <Typography>
            If you re-activate, Zealthy’s coordination team will submit another
            prior authorization to have a different GLP-1 medication covered.
          </Typography>
        ) : !!statusDescription ? (
          <Typography>{statusDescription}</Typography>
        ) : null}

        {cancelledAndNotActive ? null : !hasActiveSubscription ? (
          <StoppedStatusBar isDenied={status === PriorAuthStatus.DENIED} />
        ) : (
          <StatusBar status={status} />
        )}

        {!hasActiveSubscription ? (
          <Button
            size="small"
            onClick={() => Router.push(Pathnames.PATIENT_PORTAL_PROFILE)}
            style={{
              maxWidth: '384px',
              width: '100%',
              margin: '0 auto',
            }}
          >
            Reactivate your membership
          </Button>
        ) : (
          <Stack gap="0.5rem">
            <Button
              size="small"
              onClick={() => Router.push(Pathnames.MESSAGES)}
              style={{
                maxWidth: '384px',
                width: '100%',
                margin: '0 auto',
              }}
            >
              Message your care team
            </Button>
            {status === PriorAuthStatus.DENIED && (
              <Button
                size="small"
                onClick={() =>
                  Router.push('/patient-portal/weight-loss-treatment/compound')
                }
                style={{
                  maxWidth: '384px',
                  width: '100%',
                  margin: '0 auto',
                }}
              >
                Order semaglutide or tirzepatide
              </Button>
            )}
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

export default PriorAuthCard;
