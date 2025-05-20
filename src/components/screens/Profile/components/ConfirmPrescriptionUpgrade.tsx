import {
  PrescriptionRequestProps,
  usePatient,
  usePatientDefaultPayment,
  usePatientSubscription,
} from '@/components/hooks/data';
import ErrorMessage from '@/components/shared/ErrorMessage';
import LoadingModal from '@/components/shared/Loading/LoadingModal';
import { ED_MAPPING } from '@/constants/ed-mapping';
import { MedicationName } from '@/constants/ed-mapping/types';
import { Database } from '@/lib/database.types';
import { Pathnames } from '@/types/pathnames';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Router from 'next/router';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import ExistingPaymentMethod from '../../Checkout/components/ExistingPaymentMethod';
import TotalToday from '../../Checkout/components/TotalToday';

const ConfirmPrescriptionUpgrade = () => {
  const { name, dosage, unit, base, quantity, id } = Router.query;
  const { data: subscriptionData } = usePatientSubscription(id);
  const { data: patient } = usePatient();
  const { data: paymentMethod } = usePatientDefaultPayment();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = useSupabaseClient<Database>();

  const medication = useMemo(() => {
    if (name && dosage && unit && base && quantity) {
      const key =
        name === 'Sildenafil'
          ? 'Sildenafil (Generic Viagra)'
          : name === 'Tadalafil'
          ? 'Tadalafil (Generic Cialis)'
          : name;

      return ED_MAPPING[key as MedicationName][`${dosage} ${unit}`].quantities
        .find(q => q.value === Number(base))
        ?.otherOptions.find(o => o.quantity === Number(quantity));
    }

    return null;
  }, [base, dosage, quantity, name, unit]);

  async function onSubmit() {
    setLoading(true);
    await supabase
      .from('prescription_request')
      .insert({
        medication_quantity_id: medication?.medication_quantity_id,
        patient_id: subscriptionData?.patient_id,
        status: 'REQUESTED',
        region: patient?.region,
        specific_medication: name as string,
        quantity: Number(quantity),
        is_adjustment: true,
        discounted_price: medication?.discounted_price,
        total_price: medication?.price,
      })
      .select()
      .then(({ data }) => (data || []) as PrescriptionRequestProps[])
      .then(req => {
        req.map(async r => {
          const addToQueue = await supabase
            .from('task_queue')
            .insert({
              task_type: 'PRESCRIPTION_REQUEST',
              patient_id: subscriptionData?.patient_id,
              queue_type: 'Provider',
              created_at: subscriptionData?.current_period_end || undefined,
            })
            .select()
            .maybeSingle()
            .then(({ data }) => data);

          await supabase
            .from('prescription_request')
            .update({ queue_id: addToQueue?.id })
            .eq('id', r?.id);
        });
      });

    toast.success(
      'You have successfully requested a prescription plan upgrade.'
    );
    Router.push(Pathnames.PATIENT_PORTAL);
  }

  return (
    <Stack gap="24px">
      <Typography variant="h2">Confirm upgrade</Typography>
      {paymentMethod ? (
        <ExistingPaymentMethod
          paymentMethod={paymentMethod}
          onError={setError}
        />
      ) : (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={167}
          sx={{ borderRadius: '16px' }}
        />
      )}

      {false ? (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={162}
          sx={{ borderRadius: '16px' }}
        />
      ) : (
        <Paper
          sx={{
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid rgba(0, 0, 0, 0.19)',
          }}
        >
          <Stack gap="16px">
            <Typography>{`You will ony be charged if prescribed`}</Typography>
            <Stack direction="row" justifyContent="space-between">
              <Typography>Plan cost:</Typography>
              <Typography>${medication?.price}</Typography>
            </Stack>
            <Typography textAlign="center" fontStyle="italic">
              You will ony be charged if prescribed
            </Typography>
          </Stack>
        </Paper>
      )}

      <TotalToday amount={0} discount={0} text="Amount due" />

      {loading && (
        <LoadingModal
          title="Submitting your request..."
          description="This will take a few seconds."
        />
      )}
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
      <Button disabled={loading} fullWidth onClick={onSubmit}>
        Upgrade
      </Button>
    </Stack>
  );
};

export default ConfirmPrescriptionUpgrade;
