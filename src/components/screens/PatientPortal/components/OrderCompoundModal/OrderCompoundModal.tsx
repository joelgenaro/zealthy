import { useEffect, useState } from 'react';
import {
  Box,
  Stack,
  Modal,
  Typography,
  useMediaQuery,
  useTheme,
  Button,
} from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import Router from 'next/router';
import {
  PrescriptionRequestProps,
  usePatient,
  usePatientCompoundOrders,
} from '@/components/hooks/data';
import { PatientSubscriptionProps } from '@/lib/auth';
import ZealthyLogo from '@/components/shared/icons/ZealthyLogo';
import Logo from '@/components/shared/icons/Logo';

interface Props {
  visibleSubscriptions: PatientSubscriptionProps[];
}

const OrderCompoundModal = ({ visibleSubscriptions }: Props) => {
  const supabase = useSupabaseClient<Database>();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: patient, refetch, isLoading: loadingPatient } = usePatient();
  const { data: compoundOrders = [], isLoading: loadingOrders } =
    usePatientCompoundOrders();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const recurringMedication = visibleSubscriptions?.find(
    s => s.product === 'Recurring Weight Loss Medication'
  );
  async function fetchData() {
    if (!patient?.id) return;
    const requests = await supabase
      .from('prescription_request')
      .select(
        `*, medication_quantity ( id, medication_dosage ( medication (*) ) )`
      )
      .eq('patient_id', patient?.id)
      .in('status', [
        'REQUESTED',
        'PRE_INTAKES',
        'VERIFY_ID_PRESCRIPTION_REQUEST',
        'REQUESTED - ID must be uploaded',
      ])
      .order('created_at', { ascending: false })
      .then(({ data }) => data as PrescriptionRequestProps[]);

    const hasPendingCompoundWeightLossRequest = requests.some(
      request => request.medication_quantity_id === 98
    );

    const hasActiveWeightLoss = visibleSubscriptions?.some(
      sub =>
        sub?.subscription?.name.includes('Weight Loss') &&
        ['active', 'trialing'].includes(sub?.status)
    );

    const doesNotHaveCompoundOrder = compoundOrders.length === 0;

    const oneMonthCompoundOrder = compoundOrders?.some(
      order =>
        (order?.prescription?.duration_in_days ?? 0) <= 30 &&
        order.amount_paid !== null
    );
    const threeMonthCompoundOrder = compoundOrders?.some(
      order =>
        (order?.prescription?.duration_in_days ?? 0) <= 90 &&
        order?.amount_paid !== null
    );

    const isOralSemaglutide = visibleSubscriptions?.some(
      sub => sub?.price === 249
    );

    if (
      hasActiveWeightLoss &&
      !patient?.compound_skip &&
      doesNotHaveCompoundOrder &&
      !hasPendingCompoundWeightLossRequest &&
      !oneMonthCompoundOrder &&
      !isOralSemaglutide &&
      !threeMonthCompoundOrder
    ) {
      setOpen(true);
    }
  }

  useEffect(() => {
    if (loadingPatient || loadingOrders) {
      return;
    }
    fetchData();
  }, [loadingOrders, loadingPatient]);

  const desktopSx = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.default',
    minWidth: 300,
    minHeight: 300,
    maxHeight: '100%',
    overflow: 'auto',
    p: 4,
    outline: 'none',
    borderRadius: 2,
  };

  const mobileSx = {
    position: 'absolute',
    bgcolor: 'background.default',
    width: '100%',
    height: '100%',
    overflow: 'scroll',
    p: 4,
  };

  async function handleSkipCompound() {
    setLoading(true);
    await supabase
      .from('patient')
      .update({ compound_skip: true })
      .eq('id', patient?.id!);
    refetch ? refetch() : null;
    setOpen(o => !o);
    setLoading(false);
  }

  return (
    <Modal open={open}>
      <Box
        justifyContent="center"
        alignItems="center"
        sx={isMobile ? mobileSx : desktopSx}
      >
        <Stack
          gap={{ sm: '32px', xs: '24px' }}
          sx={
            isMobile
              ? {
                  position: 'relative',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }
              : {}
          }
        >
          {isMobile && (
            <Box
              sx={{
                color: 'inherit',
                alignSelf: 'center',
                marginBottom: '2rem',
              }}
            >
              <Logo />
            </Box>
          )}
          <Stack gap={2}>
            <Typography variant="h3" fontSize="20px !important">
              Order semaglutide or tirzepatide
            </Typography>
            <Typography mt={0.5} variant="h5" color="#1B1B1B">
              You can get your medication shipped to you quickly if you order
              semaglutide, the main active ingredient in Ozempic and Wegovy, or
              tirzepatide, the main active ingredient in Mounjaro and Zepbound,
              today.
            </Typography>
          </Stack>
          <Stack gap={2}>
            <Button
              fullWidth
              onClick={() =>
                Router.push(
                  recurringMedication?.reference_id
                    ? '/patient-portal/visit/weight-loss-refill'
                    : '/patient-portal/weight-loss-treatment/compound'
                )
              }
            >
              Continue to order
            </Button>
            <LoadingButton
              loading={loading}
              disabled={loading}
              fullWidth
              color="grey"
              onClick={handleSkipCompound}
            >
              I do not want to order either
            </LoadingButton>
            <Button variant="text" onClick={() => setOpen(false)}>
              Ignore for now
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};

export default OrderCompoundModal;
