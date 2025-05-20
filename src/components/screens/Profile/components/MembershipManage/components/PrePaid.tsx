import {
  PatientSubscriptionProps,
  usePatientSubscription,
  usePatientPrescriptionRequest,
  usePatientPriorAuths,
  usePatient,
} from '@/components/hooks/data';
import { Pathnames } from '@/types/pathnames';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Router from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import { OptionType } from '../types';
import MedicationOptionCard from './MedicationOptionCard';
import SubscriptionOptionCard from './SubscriptionOptionCard';
import differenceInCalendarMonths from 'date-fns/differenceInCalendarMonths';
import { bodyMap, getOptions, SubscriptionType } from '../options';
import WarningModal from './asset/WarningModal';

const calculateInterval = (subscription: PatientSubscriptionProps) => {
  const interval = differenceInCalendarMonths(
    new Date(subscription.current_period_end),
    new Date(subscription.current_period_start)
  );

  return interval;
};

interface PrePaidProps {
  basePath: string;
  type: SubscriptionType;
  setSpecificMedName: (name: string) => void;
}

const PrePaid = ({ basePath, type, setSpecificMedName }: PrePaidProps) => {
  const { id, page } = Router.query;
  const { data: subscription } = usePatientSubscription(id);
  const { data: prescriptionRequests } = usePatientPrescriptionRequest();
  const { data: priorAuths } = usePatientPriorAuths();
  const [showWarningModal, setShowWarningModal] = useState(false);
  const { data: patient } = usePatient();

  const handleOpenModal = useCallback(() => {
    if (subscription?.price === 249) {
      return Router.push(
        `${basePath}?page=${type === 'weight loss' ? 'weight-loss' : 'pre-pay'}`
      );
    }

    setShowWarningModal(true);
  }, [basePath, subscription?.price, type]);

  const medicationOption: OptionType = {
    popular: true,
    header: 'Order compound semaglutide or tirzepatide',
    subHeader: 'SAVE 20%',
    body: 'Starts at $151/month',
    path: '/patient-portal/weight-loss-treatment/compound',
    interval: Infinity,
    type: 'weight loss',
  };

  // KEEPING FOR FUTURE REFERENCE
  // const discountedWeightLossOption: OptionType = {
  //   popular: true,
  //   header: 'Switch to a Discounted Weight Loss Plan',
  //   subHeader: 'Save 27%',
  //   body: 'Receive Metformin or Bupropion/Naltrexone monthly for only $99/month',
  //   path: '/patient-portal/manage-memberships/downgrade',
  //   interval: Infinity,
  //   type: 'weight loss',
  // };

  const options = useMemo(() => {
    if (subscription) {
      const options = getOptions(basePath)[type] || [];
      return options.filter(
        option => option.interval > calculateInterval(subscription)
      ) as OptionType[];
    }
    return [];
  }, [basePath, subscription, type]);

  const hasWeightLossPrescriptionRequest = useMemo(() => {
    let lastSpecificMedicationName = '';

    prescriptionRequests?.forEach(request => {
      const medicationName =
        request.medication_quantity?.medication_dosage?.medication?.name?.toLowerCase();

      const isWeightLossMed =
        medicationName?.includes('glp1') ||
        medicationName?.includes('weight loss');

      const isRequestedStatus =
        request.status === 'REQUESTED' ||
        request.status === 'REQUESTED - ID must be uploaded';

      if (isRequestedStatus && isWeightLossMed) {
        lastSpecificMedicationName =
          request?.specific_medication || medicationName;
      }
    });

    setSpecificMedName(lastSpecificMedicationName || 'medication');

    return lastSpecificMedicationName;
  }, [prescriptionRequests, setSpecificMedName]);

  const hasCompoundGLP1RequestedPrescription = useMemo(() => {
    let glp1Requested = false;

    prescriptionRequests?.forEach(request => {
      const medicationName =
        request.medication_quantity?.medication_dosage?.medication?.name?.toLowerCase();
      if (medicationName?.includes('glp1') && request.status === 'REQUESTED') {
        glp1Requested = true;
      }
    });

    return glp1Requested;
  }, [prescriptionRequests]);

  const hasGLP1PriorAuth = useMemo(() => {
    return priorAuths?.some(auth => {
      const medicationName = auth?.rx_submitted?.toLowerCase() || '';

      const glp1Medications = [
        'wegovy',
        'mounjaro',
        'ozempic',
        'zepbound',
        'saxenda',
        'glp1',
      ];

      const isGLP1Medication = glp1Medications?.includes(medicationName);

      const isValidStatus = [
        'PA Submitted',
        'PA Approved',
        'Initiate Prior Auth',
      ].includes(auth?.status || '');

      return isGLP1Medication && isValidStatus;
    });
  }, [priorAuths]);

  return (
    <Stack
      gap="25px"
      sx={{
        borderRadius: '16px',
        overflow: 'auto',
        height: '100%',
        maxHeight: '100vh',
      }}
    >
      <Stack gap="1rem">
        <Typography variant="h2">{'Manage Your Plan'}</Typography>
        {subscription?.price !== 249 && (
          <Stack gap="16px">
            <Typography fontWeight="600">Save when you pre-pay!</Typography>
            <Typography variant="subtitle1">{bodyMap[type]}</Typography>
          </Stack>
        )}
      </Stack>
      <Stack gap="16px" width="100%">
        {
          (() => {
            if (subscription?.price !== 249 && type === 'weight loss') {
              return <MedicationOptionCard option={medicationOption} />;
            }
            return null;
          })() as React.ReactNode
        }

        {subscription?.price !== 249 &&
          options.map(option => (
            <SubscriptionOptionCard key={option.header} option={option} />
          ))}
      </Stack>

      <WarningModal
        open={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        basePath={basePath}
        type={type}
      />
      <Button
        variant="contained"
        fullWidth
        color="grey"
        onClick={() =>
          Router.push(`${Pathnames.PATIENT_PORTAL}/profile?page=home`)
        }
      >
        {'Back to profile'}
      </Button>
      <Link
        onClick={() => {
          Router.push(
            {
              query: {
                id,
                page:
                  type === 'weight loss'
                    ? 'weight-loss'
                    : type === 'personalized psychiatry'
                    ? 'personalized-psychiatry'
                    : 'free-month-weight-loss',
              },
            },
            undefined,
            { shallow: true }
          ).then(() => {
            window.scrollTo({
              top: 0,
              left: 0,
              behavior: 'smooth',
            });
          });
        }}
        style={{
          alignSelf: 'center',
          color: '#777',
          cursor: 'pointer',
        }}
      >
        {`Cancel ${type} plan`}
      </Link>
      <br />
    </Stack>
  );
};

export default PrePaid;
