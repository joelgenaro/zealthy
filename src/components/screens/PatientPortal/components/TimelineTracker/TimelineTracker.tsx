import React, { useEffect, useMemo, useState } from 'react';
import {
  useAllPatientInvoices,
  usePatient,
  usePatientOrders,
  useAllPatientPrescriptionRequest,
  usePatientPriorAuths,
  useWeightLossSubscription,
  usePatientTasks,
} from '@/components/hooks/data';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import Image from 'next/image';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';

const getMostRecentItem = (items: any[], dateKey = 'created_at') =>
  items?.reduce((latest: any, item: any) => {
    return !latest || new Date(item[dateKey]) > new Date(latest[dateKey])
      ? item
      : latest;
  }, null);

interface StepProgressProps {
  stages: any[];
  allStagesCompleted: boolean;
}

const StepProgress = ({ stages, allStagesCompleted }: StepProgressProps) => {
  const isMobile = useIsMobile();

  return (
    <Box display="flex" alignItems="center" bgcolor="gray.100" width="100%">
      {stages.map((stage, index) => {
        const prevStagesPending = stages
          .slice(0, index)
          .some(s => s.status === 'pending');
        return (
          <Box
            key={stage.name}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            width="100%"
            maxWidth={`${100 / stages.length}%`}
            textAlign="center"
          >
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              minWidth={80}
              position="relative"
            >
              {index < stages.length - 1 && (
                <Box
                  component="span"
                  position="absolute"
                  top="50%"
                  left="100%"
                  sx={{ transform: 'translate(-50%, -50%)' }}
                  width="100%"
                  height={8}
                  bgcolor="#00531B"
                  zIndex={-1}
                />
              )}
              <Box
                width={40}
                height={40}
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="50%"
                border={4}
                bgcolor={
                  stage.status === 'filled' && !prevStagesPending
                    ? '#00531B'
                    : 'white'
                }
                borderColor="#00531B"
                zIndex={1}
                position="relative"
              >
                {stage.status === 'filled' ? (
                  <CheckIcon
                    sx={{
                      color: 'white',
                      fontSize: `${16 + index * 2}px`,
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                ) : stage.status === 'pending' &&
                  !prevStagesPending &&
                  stage.icon ? (
                  <Image
                    src={stage.icon}
                    alt={stage.name}
                    style={{
                      marginTop: 10,
                      cursor: 'pointer',
                    }}
                    height={70}
                    onClick={() => stage.url && Router.push(stage.url)}
                  />
                ) : null}
              </Box>
            </Box>
            <Box
              height={30}
              display="flex"
              alignItems="center"
              justifyContent="center"
              marginTop={1}
            >
              <Typography
                sx={
                  !isMobile
                    ? {
                        fontSize: '0.8rem !important',
                        textAlign: 'center',
                        lineHeight: '1rem !important',
                        fontWeight: 600,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 32,
                        whiteSpace: 'pre-line',
                      }
                    : {
                        fontSize: '0.7rem !important',
                        textAlign: 'center',
                        lineHeight: '0.8rem !important',
                        fontWeight: 600,
                      }
                }
              >
                {stage.name}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

const TimelineTracker = () => {
  const { data: patientInvoices } = useAllPatientInvoices();
  const { data: patientOrders } = usePatientOrders();
  const { data: patientInfo } = usePatient();
  const { data: patientPrescriptionRequests } =
    useAllPatientPrescriptionRequest();
  const { data: patientPriorAuths } = usePatientPriorAuths();
  const { data: patientTasks } = usePatientTasks();
  const { data: weightLossSubscription } = useWeightLossSubscription();
  const supabase = useSupabaseClient<Database>();

  // State for Enclomiphene lab documents
  const [enclomipheneLabs, setEnclomipheneLabs] = useState<any[]>([]);
  const [loadingLabs, setLoadingLabs] = useState(true);

  const isProd = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

  // Always use the most recent prescription request as the focus
  const mostRecentPrescriptionRequest = useMemo(() => {
    return getMostRecentItem(patientPrescriptionRequests ?? []);
  }, [patientPrescriptionRequests]);

  const allowedIds = isProd
    ? [98, 124, 297, 298, 353]
    : [98, 124, 297, 298, 299, 302, 353];

  const shouldShowTrackerBasedOnType = useMemo(() => {
    if (!mostRecentPrescriptionRequest) return false;
    const medQuantId = mostRecentPrescriptionRequest.medication_quantity_id;
    return allowedIds.includes(medQuantId);
  }, [mostRecentPrescriptionRequest, allowedIds]);

  const currentPrescriptionIdStr = String(
    mostRecentPrescriptionRequest?.id || ''
  );

  const [showTracker, setShowTracker] = useState(true);

  useEffect(() => {
    if (currentPrescriptionIdStr) {
      const dismissed = localStorage.getItem('timelineTrackerDismissed');
      if (dismissed === currentPrescriptionIdStr) {
        setShowTracker(false);
      } else {
        setShowTracker(true);
      }
    }
  }, [currentPrescriptionIdStr]);

  const handleCloseTracker = () => {
    if (currentPrescriptionIdStr) {
      localStorage.setItem(
        'timelineTrackerDismissed',
        currentPrescriptionIdStr
      );
    }
    setShowTracker(false);
  };

  const validWeightLossSubscription = useMemo(() => {
    if (!weightLossSubscription || !weightLossSubscription.status) return false;
    const status = weightLossSubscription.status.toLowerCase();
    return status !== 'unpaid' && status !== 'past_due';
  }, [weightLossSubscription]);

  const hasPaidForLabKit = useMemo(
    () =>
      !!patientInvoices?.find(
        invoice => invoice.amount_paid === 72.5 && invoice.status === 'paid'
      ),
    [patientInvoices]
  );

  const isEnclomiphenePatient = useMemo(
    () =>
      mostRecentPrescriptionRequest?.specific_medication?.includes(
        'Enclomiphene'
      ),
    [mostRecentPrescriptionRequest]
  );

  // Fetch Enclomiphene labs from both old and new folders
  useEffect(() => {
    if (patientInfo?.id && isEnclomiphenePatient) {
      setLoadingLabs(true);

      const fetchEnclomipheneLabs = async () => {
        try {
          // Fetch from both enclomiphene lab folders
          const [newFolderResults, oldFolderResults] = await Promise.all([
            supabase.storage
              .from('patients')
              .list(`patient-${patientInfo.id}/enclomiphene-labs`),
            supabase.storage
              .from('patients')
              .list(`patient-${patientInfo.id}/enclomiphene`),
          ]);

          // Combine results
          const allLabs = [
            ...(newFolderResults.data || []),
            ...(oldFolderResults.data || []),
          ];

          setEnclomipheneLabs(allLabs);
        } catch (error) {
          console.error('Error fetching enclomiphene labs:', error);
        } finally {
          setLoadingLabs(false);
        }
      };

      fetchEnclomipheneLabs();
    } else {
      setLoadingLabs(false);
    }
  }, [patientInfo?.id, isEnclomiphenePatient, supabase]);

  const labWorksLength = enclomipheneLabs?.length || 0;
  const hasUploadedLabResults = useMemo(
    () => labWorksLength > 0 && isEnclomiphenePatient,
    [labWorksLength, isEnclomiphenePatient]
  );

  const mostRecentOrder = useMemo(() => {
    return patientOrders && patientOrders.length > 0 ? patientOrders[0] : null;
  }, [patientOrders]);

  const hasFailedPayment = mostRecentOrder?.order_status === 'PAYMENT_FAILED';
  const hasVerifiedIdentity = patientInfo?.has_verified_identity;

  const hasRequestedCompounds = useMemo(() => {
    return (
      mostRecentPrescriptionRequest?.is_visible &&
      mostRecentPrescriptionRequest?.medication_quantity_id === 98 &&
      mostRecentPrescriptionRequest?.status !== 'REJECTED'
    );
  }, [mostRecentPrescriptionRequest]);

  const labResultsReviewed = useMemo(() => {
    const latestLabTask = patientTasks
      ?.filter(task => task.task_type === 'ENCLOMIPHENE_REVIEW_LABS')
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
    return latestLabTask?.action_taken === 'COMPLETED';
  }, [patientTasks]);

  const hasBeenDelivered = useMemo(() => {
    return !!patientOrders?.find(
      order =>
        (order.order_status?.toLowerCase() === 'delivered' ||
          order.shipment_details?.toLowerCase() === 'delivered') &&
        order === mostRecentOrder &&
        order.prescription_request_id === mostRecentPrescriptionRequest?.id
    );
  }, [patientOrders, mostRecentOrder, mostRecentPrescriptionRequest]);

  const hasPrescriptionOrderForMostRecent = useMemo(() => {
    return (
      mostRecentPrescriptionRequest &&
      patientOrders?.some(
        order =>
          order.prescription_request_id === mostRecentPrescriptionRequest.id &&
          !['PAYMENT_FAILED', 'CANCELED'].includes(order.order_status ?? '')
      )
    );
  }, [mostRecentPrescriptionRequest, patientOrders]);

  const hasQualifyingPrescriptionRequest = useMemo(() => {
    return (
      mostRecentPrescriptionRequest?.status?.includes('APPROVED') &&
      hasPrescriptionOrderForMostRecent
    );
  }, [mostRecentPrescriptionRequest]);

  const hasBeenPrescribed = useMemo(() => {
    return (
      hasQualifyingPrescriptionRequest || hasPrescriptionOrderForMostRecent
    );
  }, [hasQualifyingPrescriptionRequest, hasPrescriptionOrderForMostRecent]);
  console.log(
    hasQualifyingPrescriptionRequest,
    hasPrescriptionOrderForMostRecent,
    'sasda'
  );
  const mostRecentOrderHasTrackingNumber = useMemo(() => {
    return mostRecentOrder?.tracking_number && hasBeenPrescribed;
  }, [mostRecentOrder, hasBeenPrescribed]);

  const getTrackingNumberFromGroup = useMemo(() => {
    if (!mostRecentOrder?.group_id || !patientOrders) return null;

    const ordersInGroup = patientOrders.filter(
      order =>
        order.group_id === mostRecentOrder.group_id && order.tracking_number
    );

    if (ordersInGroup.length === 0) return null;

    if (ordersInGroup.length > 1) {
      ordersInGroup.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    }

    return ordersInGroup[0]?.tracking_number;
  }, [mostRecentOrder, patientOrders]);

  const hasBeenPrescribedForPa = useMemo(() => {
    return !!patientPrescriptionRequests?.find(
      pr =>
        pr.medication_quantity_id === 124 &&
        ['APPROVED'].includes(pr?.status ?? '')
    );
  }, [patientPrescriptionRequests]);

  const hasBeenDeliveredForPa = useMemo(() => {
    const filteredPrescriptionRequests = (
      patientPrescriptionRequests ?? []
    ).filter(pr => !['REQUESTED', 'CANCELED'].includes(pr.status ?? ''));

    return (
      hasBeenPrescribedForPa &&
      !!patientOrders?.some(
        order =>
          order.order_status === 'SENT_TO_LOCAL_PHARMACY' &&
          filteredPrescriptionRequests.some(
            pr => pr.id === order.prescription_request_id
          )
      )
    );
  }, [hasBeenPrescribedForPa, patientOrders, patientPrescriptionRequests]);

  const brandNameRequest = useMemo(() => {
    return patientPrescriptionRequests?.find(
      pr => pr.medication_quantity_id === 124 && pr.is_visible === true
    );
  }, [patientPrescriptionRequests]);
  const hasRequestedBrandNames = !!brandNameRequest;
  const hasPaApproved = useMemo(() => {
    return !!patientPriorAuths?.find(
      pa =>
        pa.status?.toLowerCase().includes('approved') ||
        pa.status?.toLowerCase().includes('prescribed')
    );
  }, [patientPriorAuths]);

  const hasPaDenied = useMemo(() => {
    return !!patientPriorAuths?.some(pa =>
      pa.status?.toLowerCase().includes('denied')
    );
  }, [patientPriorAuths]);

  const paymentStageStatus = useMemo(() => {
    if (hasFailedPayment) return 'pending';
    return validWeightLossSubscription ? 'filled' : 'pending';
  }, [hasFailedPayment, validWeightLossSubscription]);

  const weightLossStagesWithPa = useMemo(
    () => [
      {
        name: 'Payment',
        status: paymentStageStatus,
        icon: '/icons/payment.png',
        url: '/patient-portal/profile?page=payment',
      },
      {
        name: 'ID Verify',
        status: hasVerifiedIdentity ? 'filled' : 'pending',
        icon: '/icons/id.png',
        url: '/patient-portal/identity-verification',
      },
      {
        name: 'Prior Authorization',
        status: hasPaApproved ? 'filled' : 'pending',
        icon: '/icons/pa.png',
        url: '/patient-portal/weight-loss-treatment/compound',
      },
      {
        name: 'Rx Prescribed',
        status: hasBeenPrescribedForPa ? 'filled' : 'pending',
        icon: '/icons/prescribe.png',
        url: Pathnames.PRESCRIPTION_ORDERS,
      },
      {
        name: 'Sent to Pharmacy',
        status: hasBeenDeliveredForPa ? 'filled' : 'pending',
        icon: '/icons/delivered.png',
        url: Pathnames.PRESCRIPTION_ORDERS,
      },
    ],
    [
      hasFailedPayment,
      hasVerifiedIdentity,
      hasPaApproved,
      hasBeenPrescribedForPa,
      hasBeenDeliveredForPa,
      paymentStageStatus,
    ]
  );

  const weightLossStages = useMemo(
    () => [
      {
        name: 'Payment',
        status: paymentStageStatus,
        icon: '/icons/payment.png',
        url: '/patient-portal/profile?page=payment',
      },
      {
        name: 'ID Verify',
        status: hasVerifiedIdentity ? 'filled' : 'pending',
        icon: '/icons/id.png',
        url: '/patient-portal/identity-verification',
      },
      {
        name: 'Request Medication',
        status: hasRequestedCompounds ? 'filled' : 'pending',
        icon: '/icons/pa.png',
        url: '/patient-portal/weight-loss-treatment/compound',
      },
      {
        name: 'Rx Prescribed',
        status: hasBeenPrescribed ? 'filled' : 'pending',
        icon: '/icons/prescribe.png',
        url: Pathnames.PRESCRIPTION_ORDERS,
      },
      {
        name: 'Receive Shipment',
        status: hasBeenDelivered ? 'filled' : 'pending',
        icon: '/icons/delivered.png',
        url: getTrackingNumberFromGroup
          ? `/patient-portal/order-tracker/${getTrackingNumberFromGroup}`
          : Pathnames.PRESCRIPTION_ORDERS,
      },
    ],
    [
      hasVerifiedIdentity,
      hasRequestedCompounds,
      isEnclomiphenePatient,
      hasBeenPrescribed,
      hasBeenDelivered,
      paymentStageStatus,
    ]
  );

  const enclomipheneStages = useMemo(
    () => [
      {
        name: 'Checkout',
        status: hasFailedPayment ? 'pending' : 'filled',
        icon: '/icons/payment.png',
        url: '/patient-portal/profile?page=payment',
      },
      {
        name: 'ID Verify',
        status: hasVerifiedIdentity ? 'filled' : 'pending',
        icon: '/icons/id.png',
        url: '/patient-portal/identity-verification',
      },
      {
        name: 'Lab Results',
        status: labResultsReviewed ? 'filled' : 'pending',
        icon: '/icons/prescribe.png',
        url:
          hasPaidForLabKit || hasUploadedLabResults
            ? '/messages?complete=enclomiphene'
            : Pathnames.PATIENT_PORTAL_DOCUMENTS,
      },
      {
        name: 'Provider Review',
        status: hasBeenPrescribed ? 'filled' : 'pending',
        icon: '/icons/prescribe.png',
        url: Pathnames.PRESCRIPTION_ORDERS,
      },
      {
        name: 'Order Fulfillment',
        status: hasBeenDelivered ? 'filled' : 'pending',
        icon: '/icons/delivered.png',
        url: getTrackingNumberFromGroup
          ? `/patient-portal/order-tracker/${getTrackingNumberFromGroup}`
          : Pathnames.PRESCRIPTION_ORDERS,
      },
    ],
    [
      hasFailedPayment,
      hasVerifiedIdentity,
      labResultsReviewed,
      hasPaidForLabKit,
      hasUploadedLabResults,
      hasBeenPrescribed,
      hasBeenDelivered,
      mostRecentOrderHasTrackingNumber,
      mostRecentOrder,
    ]
  );

  const medQuantId = mostRecentPrescriptionRequest?.medication_quantity_id;

  const stages = useMemo(() => {
    if (isEnclomiphenePatient) {
      return enclomipheneStages;
    }
    if (
      medQuantId === 98 &&
      mostRecentOrder?.order_status === 'SENT_TO_LOCAL_PHARMACY'
    ) {
      return weightLossStages;
    }
    if (
      hasRequestedBrandNames &&
      !hasPaDenied &&
      mostRecentPrescriptionRequest?.medication_quantity_id === 124
    ) {
      return weightLossStagesWithPa;
    }
    if (hasPaDenied) {
      return weightLossStages;
    }
    return weightLossStages;
  }, [
    isEnclomiphenePatient,
    medQuantId,
    hasPaApproved,
    weightLossStagesWithPa,
    hasRequestedBrandNames,
    patientPriorAuths,
    weightLossStages,
    enclomipheneStages,
  ]);

  const allStagesCompleted = useMemo(
    () => stages.length > 0 && stages.every(stage => stage.status === 'filled'),
    [stages]
  );

  return !shouldShowTrackerBasedOnType || !showTracker ? null : (
    <Box sx={{ position: 'relative' }}>
      {allStagesCompleted && (
        <Box
          sx={{
            position: 'relative',
            top: 6,
            right: 6,
            display: 'flex',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <IconButton
            aria-label="close"
            size="small"
            onClick={handleCloseTracker}
            sx={{ cursor: 'pointer' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
      <StepProgress stages={stages} allStagesCompleted={allStagesCompleted} />
    </Box>
  );
};

export default TimelineTracker;
