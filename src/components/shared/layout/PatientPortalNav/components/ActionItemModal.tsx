import { useEffect, useState } from 'react';
import { Close } from '@mui/icons-material';
import { Box, IconButton, Modal, Stack, Typography } from '@mui/material';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import ActionItems from '@/components/screens/PatientPortal/components/ActionItems';
import {
  useAllVisiblePatientSubscription,
  usePatient,
  usePreferredPharmacy,
  useWeightLossSubscription,
} from '@/components/hooks/data';
import { useRouter } from 'next/router';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  setActionItemCount: (count: number) => void;
  actionItemCount: number;
  hasNonCompoundGLP1Request: boolean;
}

const ActionItemModal = ({
  open,
  setOpen,
  actionItemCount,
  setActionItemCount,
  hasNonCompoundGLP1Request,
}: Props) => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [show, setShow] = useState(false);
  const { data: patient } = usePatient();
  const { data: visibleSubscriptions } = useAllVisiblePatientSubscription();
  const { data: weightLossPatient, isLoading } = useWeightLossSubscription();
  const [refresh, setRefresh] = useState(false);

  const { data: preferredPharmacy } = usePreferredPharmacy();

  const hasActiveWeightLoss = visibleSubscriptions?.some(
    sub =>
      (sub?.subscription?.id === 4 &&
        ['active', 'trialing'].includes(sub?.status)) ||
      (sub?.subscription?.name === 'Zealthy Weight Loss Access' &&
        ['active', 'trialing'].includes(sub?.status))
  );

  useEffect(() => {
    setRefresh(!refresh);
    if (open) {
      setShow(true);
    }
  }, [open, router]);

  const closeModal = () => {
    setShow(false);
    if (isMobile) {
      setTimeout(() => setOpen(false), 250);
    } else {
      setOpen(false);
    }
  };

  const styles = isMobile
    ? {
        position: 'absolute',
        height: '100%',
        width: '100%',
        backgroundColor: '#fff',
        right: show ? '0%' : '-100%',
        transition: 'right 0.25s ease-in-out',
        top: 'auto',
        left: 'auto',
        transform: 'none',
        minWidth: 'auto',
        minHeight: 'auto',
        maxHeight: '100%',
        borderRadius: 0,
        padding: '20px',
      }
    : {
        position: 'absolute',
        backgroundColor: '#fff',
        height: 'auto',
        width: 'auto',
        right: 'auto',
        transition: 'none',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        minWidth: 500,
        minHeight: 300,
        maxHeight: '90%',
        borderRadius: 5,
        padding: '25px',
      };

  return (
    <Modal open={open} keepMounted={true}>
      <Stack
        direction="column"
        gap={isMobile ? '25px' : '10px'}
        alignItems="center"
        sx={styles}
        onClick={() => closeModal()}
      >
        <Stack
          width="100%"
          justifyContent="space-between"
          alignItems="center"
          flexDirection="row"
          onClick={closeModal}
          sx={{ cursor: 'pointer' }}
        >
          <Typography variant="h3" style={{ fontSize: '20px' }}>
            Action Items
          </Typography>
          <IconButton>
            <Close style={{ fontSize: isMobile ? '20px' : '25px' }} />
          </IconButton>
        </Stack>
        <Box
          display="flex"
          flexDirection="column"
          overflow="auto"
          gap="50px"
          paddingRight="5px"
        >
          {!actionItemCount && (
            <Typography variant="h4" textAlign="center">
              No items left to complete!
            </Typography>
          )}
          <ActionItems
            refresh={refresh}
            showHeader={false}
            patientId={patient?.id}
            activeWeightLoss={hasActiveWeightLoss || false}
            setActionItemCount={setActionItemCount}
            isNotWeightLossCompound={
              weightLossPatient?.price !== 449 &&
              weightLossPatient?.price !== 297 &&
              !isLoading
            }
            hasNonCompoundGLP1Request={hasNonCompoundGLP1Request}
          />
        </Box>
      </Stack>
    </Modal>
  );
};

export default ActionItemModal;
