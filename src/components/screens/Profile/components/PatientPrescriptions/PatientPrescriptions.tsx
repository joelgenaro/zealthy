import { PatientSubscriptionProps } from '@/components/hooks/data';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { format } from 'date-fns';
import { SUBSCRIPTIONS_STATUS } from '@/constants/subscriptions-status';
import PrescriptionRenewConfirmationModal from './PrescriptionRenewConfirmationModal';

const toMonth = (number?: number | null) => {
  if (!number) return 0;
  return Math.round(number / 30);
};

function getUnitByType(type: string) {
  switch (type) {
    case 'Zealthy Birth Control':
      return 'packs';
    case 'Zealthy ED':
      return 'tablets';
    case 'Zealthy Sex + Hair':
      return 'troches';
    case 'Zealthy Hair Treatment':
      return 'tablets';
    default:
      return 'units';
  }
}

export type PatientPrescriptionsType =
  | 'Zealthy Birth Control'
  | 'Zealthy ED'
  | 'Zealthy Hair Treatment'
  | 'Zealthy Enclomiphene'
  | 'Zealthy Sex + Hair'
  | 'Zealthy Pre Workout'
  | 'Zealthy Skin Care'
  | 'Zealthy Mental Health'
  | 'Zealthy Sleep'
  | 'Zealthy Menopause'
  | 'Zealthy Prep';

interface PatientPrescriptionsProps {
  prescription: PatientSubscriptionProps;
  type: PatientPrescriptionsType;
}

const PatientPrescriptions = ({
  prescription,
  type,
}: PatientPrescriptionsProps) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const frequency = useMemo(() => {
    if (type === 'Zealthy ED') {
      return `${prescription?.order?.prescription?.dispense_quantity} pills/troches`;
    }

    if (
      prescription?.order?.prescription?.medication
        ?.toLowerCase()
        ?.includes('tadalafil + finasteride + minoxidil')
    ) {
      return `${Math.floor(
        prescription?.order?.prescription?.dispense_quantity || 0
      )} day supply`;
    }
    return prescription?.interval === 'month'
      ? `${(prescription?.interval_count ?? 0) * 30} day supply`
      : `${prescription?.interval_count} day supply`;
  }, [
    prescription?.interval,
    prescription?.interval_count,
    prescription?.order?.prescription?.dispense_quantity,
    prescription?.order?.prescription?.medication,
    type,
  ]);

  const isedHL = prescription?.order?.prescription?.medication
    ?.toLowerCase()
    ?.includes('tadalafil + finasteride + minoxidil');

  const currentPeriodEnd = prescription?.current_period_end
    ? format(new Date(prescription?.current_period_end), 'MMMM dd, yyyy')
    : null;

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  return (
    <Stack gap={isMobile ? '12px' : '16px'}>
      <Paper
        sx={{
          padding: isMobile ? '16px' : '20px',
          border: '1px solid #E0E0E0',
          borderRadius: '12px',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Stack alignItems="start" gap={isMobile ? '6px' : '8px'}>
          {prescription.status ===
            SUBSCRIPTIONS_STATUS.SCHEDULED_FOR_CANCELLATION && (
            <Typography
              variant="caption"
              textAlign="center"
              width="100%"
              bgcolor="#FFEAE3"
              borderRadius="12px"
              sx={{
                fontSize: '11px !important',
                lineHeight: '16px !important',
                my: '4px',
              }}
            >
              Membership will end on [{currentPeriodEnd}]. Subscribe to continue
              care today.
            </Typography>
          )}
          {prescription.status === SUBSCRIPTIONS_STATUS.CANCELED && (
            <Typography
              variant="caption"
              textAlign="center"
              width="100%"
              bgcolor="#FFEAE3"
              borderRadius="12px"
              sx={{
                fontSize: '11px !important',
                lineHeight: '16px !important',
                my: '4px',
              }}
            >
              Membership is cancelled. Renew to continue care today.
            </Typography>
          )}

          <Typography
            variant="h3"
            sx={{
              fontSize: isMobile ? '14px !important' : '16px !important',
              fontWeight: '600',
              lineHeight: isMobile ? '20px !important' : '24px !important',
              color: '#989898',
            }}
          >
            {type}
          </Typography>
          <Stack
            direction="column"
            alignItems="start"
            sx={{ width: '100%', overflow: 'hidden' }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontSize: isMobile ? '12px' : '14px',
                lineHeight: '20px',
                fontWeight: '500',
                width: '100%',
                textAlign: 'left',
                color: '#4A4A4A',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {isedHL
                ? 'Sex + Hair Medication'
                : prescription.order?.prescription?.medication}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                fontSize: isMobile ? '12px' : '14px',
                lineHeight: '20px',
                fontWeight: '500',
                color: '#4A4A4A',
              }}
            >
              {frequency}
            </Typography>
          </Stack>
          {prescription.status === SUBSCRIPTIONS_STATUS.ACTIVE && (
            <Link
              href="/manage-prescriptions/subscriptions"
              style={{
                fontWeight: '600',
                fontSize: isMobile ? '13px' : '15px',
                cursor: 'pointer',
                textDecoration: 'none',
                color: '#027C2A',
              }}
            >
              View details
            </Link>
          )}
          {prescription.status ===
            SUBSCRIPTIONS_STATUS.SCHEDULED_FOR_CANCELLATION && (
            <Typography
              onClick={handleOpenModal}
              style={{
                fontWeight: '600',
                fontSize: isMobile ? '13px' : '15px',
                cursor: 'pointer',
                textDecoration: 'none',
                color: '#027C2A',
              }}
            >
              Subscribe to continue care
            </Typography>
          )}
          {prescription.status === SUBSCRIPTIONS_STATUS.CANCELED && (
            <Typography
              onClick={handleOpenModal}
              style={{
                fontWeight: '600',
                fontSize: isMobile ? '13px' : '15px',
                cursor: 'pointer',
                textDecoration: 'none',
                color: '#027C2A',
              }}
            >
              Renew membership
            </Typography>
          )}

          <PrescriptionRenewConfirmationModal
            isOpen={isOpen}
            prescription={prescription}
            onClose={() => setIsOpen(false)}
          />
        </Stack>
      </Paper>
    </Stack>
  );
};

export default PatientPrescriptions;
