import { useEffect, useState } from 'react';
import { differenceInDays, differenceInHours } from 'date-fns';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import {
  Box,
  Stack,
  useMediaQuery,
  useTheme,
  Button,
  Typography,
} from '@mui/material';
import { Database } from '@/lib/database.types';
import { PatientSubscriptionProps } from '@/lib/auth';
import { usePatient, usePatientPriorAuths } from '@/components/hooks/data';
import { ErrorOutlineRounded } from '@mui/icons-material';
import BasicModal from '@/components/shared/BasicModal';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';
import { PriorAuthStatus } from '@/types/priorAuthStatus';
import { OrderProps } from '@/components/screens/Prescriptions/OrderHistoryContent';
import { getShipmentStatus, orderStatusMap } from '@/utils/orderStatus';
import { OrderStatus } from '@/types/orderStatus';
import medNameFilter from '@/utils/medicationNameFilter';

interface Props {
  orders: OrderProps[];
  subscriptions: PatientSubscriptionProps[];
  specificCompoundRequestMed: string | null;
}

const ReactivateWarningModal = ({
  orders,
  subscriptions,
  specificCompoundRequestMed,
}: Props) => {
  const theme = useTheme();
  const { data: patient, refetch } = usePatient();
  const { data: priorAuths } = usePatientPriorAuths();
  const supabase = useSupabaseClient<Database>();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [closed, setClosed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const deliveredOrder = orders.find(order => {
    let status;
    const shipmentStatus = getShipmentStatus(order);
    const orderStatus = orderStatusMap[order?.order_status || ''];

    if (orderStatus === OrderStatus.CANCELED) {
      status = OrderStatus.CANCELED;
    } else if (shipmentStatus) {
      status = shipmentStatus;
    } else {
      status = orderStatus;
    }

    return status === OrderStatus.DELIVERED;
  });

  let orderMedName: any = '';
  if (deliveredOrder) {
    orderMedName = deliveredOrder?.prescription_id?.medication;
    orderMedName =
      orderMedName?.charAt(0).toUpperCase() + orderMedName?.slice(1);
    orderMedName = medNameFilter(orderMedName);
    orderMedName = orderMedName?.split(' ')[0];
  }

  const hasActiveSubscription = subscriptions.some(
    subscription => subscription.status === 'active'
  );

  const scheduledForCancelationSub = subscriptions.find(
    subscription => subscription.status === 'scheduled_for_cancelation'
  );

  let daysUntilCancellation = 0;

  if (scheduledForCancelationSub && scheduledForCancelationSub?.cancel_at) {
    const currentDate = new Date();
    daysUntilCancellation = differenceInDays(
      new Date(scheduledForCancelationSub?.cancel_at),
      currentDate
    );
  }

  useEffect(() => {
    if (!patient || closed) return;

    const lastDeniedReactivationAt = new Date(
      patient?.denied_reactivation_at || 0
    );

    const hoursSinceDeniedReactivation = differenceInHours(
      new Date(),
      lastDeniedReactivationAt
    );

    if (!hasActiveSubscription && hoursSinceDeniedReactivation > 24) {
      if (specificCompoundRequestMed || priorAuths?.length || deliveredOrder) {
        setIsOpen(true);
      }
    }
  }, [
    closed,
    patient,
    isOpen,
    hasActiveSubscription,
    deliveredOrder,
    priorAuths,
    specificCompoundRequestMed,
  ]);

  const handleSkip = async () => {
    if (!patient?.id) return;
    setIsOpen(false);
    setClosed(true);
    await supabase
      .from('patient')
      .update({ denied_reactivation_at: new Date().toISOString() })
      .eq('id', patient?.id);

    await refetch();
  };

  return (
    <BasicModal isOpen={isOpen} useMobileStyle={true}>
      <Stack>
        <Box
          sx={{
            width: '100%',
            height: 'auto',
            padding: '12px 15px',
            backgroundColor: '#eeb1a9',
            borderRadius: '10px',
            marginBottom: '2rem',
          }}
        >
          <Stack direction="row" alignItems="center" gap={1}>
            <ErrorOutlineRounded fontSize="small" />
            <Typography>
              {`Your membership ${
                daysUntilCancellation
                  ? `expires in ${daysUntilCancellation} days.`
                  : 'is currently cancelled.'
              }`}
            </Typography>
          </Stack>
        </Box>
        <Stack gap={3}>
          <Typography
            style={{
              fontSize: '20px',
              lineHeight: '25px',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            {specificCompoundRequestMed ? (
              <>
                Your pending{' '}
                <b>compound {specificCompoundRequestMed} request processing</b>{' '}
                has been <b style={{ color: '#FF5757' }}>stopped</b>
              </>
            ) : !!priorAuths?.length ? (
              <>
                {priorAuths[0] &&
                priorAuths[0].status === PriorAuthStatus.CANCELLED ? (
                  <>
                    Your approved <b>prior authorization</b> for{' '}
                    {priorAuths[0].rx_submitted} has been
                    <b style={{ color: '#FF5757' }}> cancelled</b>
                  </>
                ) : (
                  <>
                    Your pending <b>GLP-1 coverage prior authorization</b> has
                    been <b style={{ color: '#FF5757' }}>stopped</b>
                  </>
                )}
              </>
            ) : deliveredOrder ? (
              <>
                Your {orderMedName || 'medication'} has been delivered. Please{' '}
                <b style={{ color: '#FF5757' }}>
                  reactivate your membership to order refills
                </b>
              </>
            ) : null}
          </Typography>
          <Typography>
            {specificCompoundRequestMed ? (
              <>
                Your request processing has been stopped and will be resumed
                when you <b>reactivate your membership</b>.
              </>
            ) : !!priorAuths?.length ? (
              <>
                {priorAuths[0] &&
                priorAuths[0].status === PriorAuthStatus.CANCELLED ? (
                  <>
                    Your prior authorization to have your insurance cover your
                    {priorAuths[0].rx_submitted}, which was approved, has been
                    cancelled. It will be reactivated if you{' '}
                    <b>reactivate your membership</b>.
                  </>
                ) : (
                  <>
                    Your request processing has been stopped and will be resumed
                    when you <b>reactivate your membership</b>.
                  </>
                )}
              </>
            ) : deliveredOrder ? (
              <>
                To continue getting {orderMedName || 'your medication'} and
                other services from Zealthy, you must{' '}
                <b>reactivate your membership</b>.
              </>
            ) : null}
          </Typography>
        </Stack>
        <Stack gap={1} mt={6}>
          <Button
            size="small"
            onClick={() => Router.push(Pathnames.PATIENT_PORTAL_PROFILE)}
          >
            Reactivate membership
          </Button>
          <Button variant="text" size="small" onClick={handleSkip}>
            No, thanks
          </Button>
        </Stack>
      </Stack>
    </BasicModal>
  );
};

export default ReactivateWarningModal;
