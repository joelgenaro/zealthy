import {
  usePatientCareTeam,
  usePatientDefaultPayment,
  useSubscription,
  useWeightLossSubscription,
  usePatient,
} from '@/components/hooks/data';
import { usePayment } from '@/components/hooks/usePayment';
import ExistingPaymentMethod from '@/components/screens/Checkout/components/ExistingPaymentMethod';
import ErrorMessage from '@/components/shared/ErrorMessage';

import LoadingModal from '@/components/shared/Loading/LoadingModal';
import { Database } from '@/lib/database.types';
import { Pathnames } from '@/types/pathnames';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Router from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useVWO } from '@/context/VWOContext';

const ConfirmDowngrade = () => {
  const { plan } = Router.query;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { data: subscription } = useSubscription(plan as string);
  const { data: paymentMethod } = usePatientDefaultPayment();
  const { data: weightLoss } = useWeightLossSubscription();
  const { cancelSubscription, renewSubscription } = usePayment();
  const { data: careTeam } = usePatientCareTeam();
  const supabase = useSupabaseClient<Database>();

  const removeProvider = useCallback(async () => {
    if (!careTeam) return;

    const provider = careTeam.find(c => c.role?.includes('Provider'));
    if (provider) {
      supabase.from('patient_care_team').delete().eq('id', provider?.id);
    }

    return;
  }, [careTeam, supabase]);

  const next = useCallback(() => {
    return Router.replace(Pathnames.PATIENT_PORTAL_PROFILE);
  }, []);

  const onSubmit = useCallback(async () => {
    if (!weightLoss || !subscription) {
      return;
    }

    setLoading(true);

    //create new subscription
    await renewSubscription({
      trialEnd: Math.floor(
        new Date(weightLoss.current_period_end).getTime() / 1000
      ),
      id: subscription?.id!,
      planId: subscription?.reference_id!,
      reference_id: weightLoss?.reference_id!, //this one needs to cancel old one
    });

    await Promise.all([
      //cancel old subscription and hide it
      cancelSubscription(weightLoss?.reference_id!, `Downgrade to ${plan}`),
      //unassigned provider
      removeProvider(),
    ]);

    toast.success(`You have updated your membership and will save $86/month`);
    next();
  }, [
    cancelSubscription,
    next,
    plan,
    removeProvider,
    renewSubscription,
    subscription,
    weightLoss,
  ]);

  const hasSamePlan = useMemo(() => {
    if (weightLoss && subscription) {
      return weightLoss.subscription.reference_id === subscription.reference_id;
    }
    return false;
  }, [subscription, weightLoss]);

  return (
    <Stack gap="24px">
      <Typography variant="h2">
        Switch to a coaching only plan? You will not be eligible for medical
        care with your provider and your monthly membership will be $49 instead
        of $135. You will save $86 every month with this plan.
      </Typography>
      <Paper
        component={Stack}
        gap="8px"
        sx={{
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid rgba(0, 0, 0, 0.19)',
        }}
      >
        <Stack alignItems="center">
          <Typography
            bgcolor="#F7F9A5"
            padding="8px 24px"
            borderRadius="12px"
            fontWeight={600}
            width="fit-content"
          >
            Save $86/month off your current plan
          </Typography>
        </Stack>
        <Typography
          sx={{
            color: '#989898',
          }}
        >
          {plan}
        </Typography>
        <Stack>
          <Typography>Unlimited messaging with dedicated coach.</Typography>
          <Typography>
            Optional phone or video sessions with your coach.
          </Typography>
          <Typography>You can change your coach any time.</Typography>
        </Stack>
      </Paper>

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

      {loading && (
        <LoadingModal
          title="Updating subscription..."
          description="This will take a few seconds."
        />
      )}

      {hasSamePlan ? (
        <>
          <Typography color="green" textAlign="center">
            Good news! You are already subscribed to this plan.
          </Typography>
          <Button fullWidth onClick={next}>
            Next
          </Button>
        </>
      ) : (
        <>
          {error ? <ErrorMessage>{error}</ErrorMessage> : null}
          <Button disabled={loading} fullWidth onClick={onSubmit}>
            Confirm order - $0 due today
          </Button>
        </>
      )}

      <Stack
        gap="24px"
        sx={{
          fontSize: '12px',
          fontStyle: 'italic',
          fontWeight: 400,
          lineHeight: '22px',
          letterSpacing: '0.06px',
          textAlign: 'center',
        }}
      >
        <Typography>
          *You will have a dedicated coach who can help with your nutrition,
          lifestyle tips, and more. They will develop a customized plan with you
          to achieve lasting weight loss.
        </Typography>
        <Typography>
          You are eligible for this program, which saves you $86 per month,
          because you were not eligible for GLP-1 medication.
        </Typography>
      </Stack>
    </Stack>
  );
};

export default ConfirmDowngrade;
