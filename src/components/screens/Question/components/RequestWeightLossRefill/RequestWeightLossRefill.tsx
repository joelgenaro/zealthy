import { useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Stack, Typography } from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import {
  PrescriptionRequestProps,
  useActivePatientSubscription,
  useAllVisiblePatientSubscription,
  usePatient,
} from '@/components/hooks/data';
import { useQuestionnaireResponses } from '@/components/hooks/useQuestionnaireResponses';
import { useVisitAsync } from '@/components/hooks/useVisit';
import Loading from '@/components/shared/Loading/Loading';
import { Database } from '@/lib/database.types';
import { useFetchMedication } from '@/components/hooks/useFetchMedication';
import { useTitrationSelection } from '@/components/hooks/useTitrationSelection';
import { useMutatePatientActionItems } from '@/components/hooks/useMutatePatientActionItems';
import SubscriptionRestartModal from '@/components/shared/SubscriptionRestartModal';
import Router from 'next/router';
import {
  useReactivateSubscription,
  useRenewSubscription,
} from '@/components/hooks/mutations';

function compareFn(a: any, b: any) {
  if (new Date(a.created_at) < new Date(b.created_at)) {
    return -1;
  } else if (new Date(a.created_at) > new Date(b.created_at)) {
    return 1;
  }
  return 0;
}

interface RequestWeightLossRefillProps {
  nextPage: (nextPage?: string) => void;
}
const RequestWeightLossRefill = ({
  nextPage,
}: RequestWeightLossRefillProps) => {
  const supabase = useSupabaseClient<Database>();
  const nextMed = useTitrationSelection();
  const { medication } = useFetchMedication('Weight Loss Medication');
  const { data: patient } = usePatient();
  const { data: patientSubscriptions, isFetched } =
    useActivePatientSubscription();
  const { data: allPatientSubscriptions, refetch } =
    useAllVisiblePatientSubscription();
  const reactivateSubscription = useReactivateSubscription();
  const renewSubscription = useRenewSubscription();
  const { updateOnlineVisit } = useVisitAsync();
  const submitQuestionnaireResponses = useQuestionnaireResponses();
  const { updateActionItem } = useMutatePatientActionItems();
  const [loading, setLoading] = useState<boolean>(false);
  const [openScheduledForCancelation, setOpenScheduledForCancelation] =
    useState(false);
  const [openCanceled, setOpenCanceled] = useState(false);
  const [hasReactivated, setHasReactivated] = useState(false);

  const bundlePlan = patientSubscriptions?.find(
    s => s.price === 297 || s.price === 449
  );

  const weightLossSubs = allPatientSubscriptions
    ?.filter(s => s.subscription.name.includes('Weight Loss'))
    .sort(compareFn);
  const weightLossSubscription = useMemo(
    () =>
      weightLossSubs?.find(s => s.status === 'active') || weightLossSubs?.[0],
    [weightLossSubs]
  );

  const handleScheduledForCancelationClose = () => {
    hasReactivated ? nextPage() : Router.back();
    setOpenScheduledForCancelation(false);
  };

  const handleScheduledForCancelation = async () => {
    await submitRefill();
    refetch();
  };

  const handleCanceled = async () => {
    await submitRefill();
    refetch();
  };

  const handleCanceledClose = () => {
    hasReactivated ? nextPage() : Router.back();
    setOpenCanceled(false);
  };

  const fetchCareTeam = useCallback(async () => {
    if (!patient?.id) {
      return;
    }
    return supabase
      .from('patient_care_team')
      .select('*, clinician(id, canvas_practitioner_id)')
      .eq('patient_id', patient?.id)
      .then(({ data }) => {
        return data;
      });
  }, [supabase, patient]);
  console.log(nextMed, 'next');
  const submitRefill = useCallback(async () => {
    const careTeam = await fetchCareTeam();

    if (openScheduledForCancelation) {
      await reactivateSubscription.mutateAsync(
        weightLossSubscription?.reference_id || ''
      );
      setHasReactivated(true);
    }
    let newSubscription;
    if (openCanceled) {
      const newSub: any = await renewSubscription.mutateAsync(
        weightLossSubscription
      );
      newSubscription = {
        ...weightLossSubscription,
        status: newSub?.subscription?.status,
        current_period_end: newSub?.subscription?.current_period_end * 1000,
        reference_id: newSub?.subscription?.id,
      };
      setHasReactivated(true);
    }

    let requests = [];

    sessionStorage.setItem('willPromptRateZealthyPurchase', 'true');

    if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
      window.freshpaint?.track('completed-refill-purchase');
    }

    requests.push(
      submitQuestionnaireResponses(),
      updateActionItem({
        patient_id: patient?.id!,
        completed_at: new Date().toISOString(),
        completed: true,
        type: 'PRESCRIPTION_RENEWAL_REQUEST',
      })
    );

    if (medication?.medication_quantity_id) {
      requests.push(
        supabase
          .from('prescription_request')
          .insert({
            medication_quantity_id: medication.medication_quantity_id,
            status: 'REQUESTED',
            patient_id: patient?.id,
            region: patient?.region,
            note: `refill request (weight loss)${
              bundlePlan ? '- BUNDLED' : ''
            }`,
            specific_medication: 'glp1',
            care_team: careTeam?.map(c => c.clinician_id) as number[],
          })
          .select()
          .maybeSingle()
          .then(({ data }) => (data || []) as PrescriptionRequestProps)
          .then(async res => {
            console.log(res, 'res');
            const providerId = careTeam?.find(c =>
              c.role?.includes('Provider')
            )?.clinician_id;
            const addToQueue = supabase
              .from('task_queue')
              .insert({
                task_type: 'PRESCRIPTION_REFILL',
                patient_id: patient?.id,
                queue_type: 'Provider (QA)',
              })
              .select()
              .single()
              .then(({ data }) => data)
              .then(async d => {
                await supabase
                  .from('prescription_request')
                  .update({ queue_id: d?.id })
                  .eq('id', res.id);
              });
          })
      );
    }

    Promise.allSettled(requests).then(() => {
      updateOnlineVisit({
        status: 'Completed',
        completed_at: new Date().toISOString(),
        intakes: [],
      });
      openScheduledForCancelation ? null : nextPage();
    });
  }, [
    fetchCareTeam,
    medication?.medication_quantity_id,
    nextPage,
    patient?.canvas_patient_id,
    patient?.id,
    patient?.region,
    isFetched,
    submitQuestionnaireResponses,
    supabase,
    updateOnlineVisit,
  ]);

  useEffect(() => {
    if (weightLossSubscription?.status === 'scheduled_for_cancelation') {
      setLoading(false);
      setOpenScheduledForCancelation(true);
      return;
    }

    if (weightLossSubscription?.status === 'canceled') {
      setLoading(false);
      setOpenCanceled(true);
      return;
    }
  }, [weightLossSubscription?.status]);

  useEffect(() => {
    if (
      patient?.id &&
      medication?.medication_quantity_id &&
      isFetched &&
      !['canceled', 'scheduled_for_cancelation']?.includes(
        weightLossSubscription?.status || ''
      )
    ) {
      submitRefill();
    }
  }, [
    patient?.id,
    medication?.medication_quantity_id,
    isFetched,
    weightLossSubscription?.status,
  ]);

  return (
    <Container maxWidth="xs">
      <Stack alignItems="center" gap={3}>
        <SubscriptionRestartModal
          titleOnSuccess={
            'Your weight loss membership has been reactivated and your refill request has been submitted to your provider. Remember that you need an active membership to receive your refill.'
          }
          onConfirm={handleCanceled}
          onClose={handleCanceledClose}
          title={
            'Reactivate your weight loss subscription to receive GLP-1 refill?'
          }
          description={[
            'Once you confirm below, your Zealthy Weight Loss subscription will become active, which will allow your request to be sent to a Zealthy medical provider for your GLP-1 medication to be refilled (if clinically appropriate).',
            'This will enable you to receive care including GLP-1 medication if appropriate for weight loss, get continued access to our coordination team to help make medications more affordable, and begin working with your coach again',
          ]}
          open={openCanceled}
          buttonText="Yes, reactivate and order"
        />
        <SubscriptionRestartModal
          titleOnSuccess={
            'Your weight loss membership has been reactivated and your refill request has been submitted to your provider. Remember that you need an active membership to receive your refill.'
          }
          open={openScheduledForCancelation}
          title={
            'Reactivate your weight loss subscription to receive GLP-1 refill?'
          }
          description={[
            'Once you confirm below, your Zealthy Weight Loss subscription will become active, which will allow your request to be sent to a Zealthy medical provider for your GLP-1 medication to be refilled (if clinically appropriate).',
            'This will enable you to receive care including GLP-1 medication if appropriate for weight loss, get continued access to our coordination team to help make medications more affordable, and begin working with your coach again',
          ]}
          onConfirm={handleScheduledForCancelation}
          onClose={handleScheduledForCancelationClose}
          buttonText="Yes, reactivate and order"
        />
        <Loading />
        {!['canceled', 'scheduled_for_cancelation']?.includes(
          weightLossSubscription?.status || ''
        ) ? (
          <Typography variant="h3">Submitting your refill request</Typography>
        ) : null}
      </Stack>
    </Container>
  );
};

export default RequestWeightLossRefill;
