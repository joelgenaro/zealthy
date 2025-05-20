import { useCallback, useEffect } from 'react';
import { Container, Stack, Typography } from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import {
  PrescriptionRequestProps,
  useActivePatientSubscription,
  usePatient,
} from '@/components/hooks/data';
import { useQuestionnaireResponses } from '@/components/hooks/useQuestionnaireResponses';
import { useVisitAsync, useVisitState } from '@/components/hooks/useVisit';
import Loading from '@/components/shared/Loading/Loading';
import { Database } from '@/lib/database.types';
import { useFetchMedication } from '@/components/hooks/useFetchMedication';
import { useTitrationSelection } from '@/components/hooks/useTitrationSelection';
import { bundleCompletedRefill } from '@/utils/freshpaint/events';
import { capitalize } from '@/utils/capitalize';
import { useMutatePatientActionItems } from '@/components/hooks/useMutatePatientActionItems';

interface RequestWeightLossRefillProps {
  nextPage: (nextPage?: string) => void;
}
const RequestCompoundWeightLossRefill = ({
  nextPage,
}: RequestWeightLossRefillProps) => {
  const supabase = useSupabaseClient<Database>();
  const nextMed = useTitrationSelection();
  const { medication } = useFetchMedication('GLP1 Medication');
  const { data: patient } = usePatient();
  const { data: patientSubscriptions, isFetched } =
    useActivePatientSubscription();
  const { questionnaires } = useVisitState();
  const { updateOnlineVisit } = useVisitAsync();
  const submitQuestionnaireResponses = useQuestionnaireResponses();
  const { updateActionItem } = useMutatePatientActionItems();

  const bundlePlan = patientSubscriptions?.find(
    s => s.price === 249 || s.price === 297 || s.price === 449
  );
  const isMonthlyRecurring = patientSubscriptions?.find(
    s =>
      s.product === 'Recurring Weight Loss Medication' &&
      s.interval_count === 30
  );
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

  const submitRefill = useCallback(async () => {
    const careTeam = await fetchCareTeam();

    let requests = [];

    sessionStorage.setItem('willPromptRateZealthyPurchase', 'true');

    if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
      window.freshpaint?.track('completed-refill-purchase');
    }

    requests.push(
      submitQuestionnaireResponses(),
      questionnaires?.some(q => q.name === 'weight-loss-quarterly-checkin') ||
        isMonthlyRecurring
        ? updateActionItem({
            patient_id: patient?.id!,
            completed_at: new Date().toISOString(),
            completed: true,
            type: 'COMPOUND_MEDICATION_DOSAGE_UPDATE_REQUEST',
          })
        : updateActionItem({
            patient_id: patient?.id!,
            completed_at: new Date().toISOString(),
            completed: true,
            type: 'PRESCRIPTION_RENEWAL_REQUEST',
          })
    );

    if (
      medication?.medication_quantity_id &&
      questionnaires?.some(q => q.name === 'weight-loss-quarterly-checkin')
    ) {
      requests.push(
        supabase
          .from('prescription_request')
          .insert({
            medication_quantity_id: medication.medication_quantity_id,
            status: 'REQUESTED',
            patient_id: patient?.id,
            region: patient?.region,
            note: `dosage escalation request (${capitalize(
              nextMed?.selectedMed?.subscription_plan?.split('_')[0]
            )} ${nextMed?.selectedMed?.vial_size} )${
              bundlePlan ? '- BUNDLED' : ''
            }`,
            specific_medication: `${capitalize(
              nextMed?.selectedMed?.subscription_plan?.split('_')[0]
            )} ${nextMed?.selectedMed?.vial_size}`,
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
    if (
      medication?.medication_quantity_id &&
      questionnaires?.some(q => q.name === 'weight-loss-bundle-reorder')
    ) {
      requests.push(
        bundleCompletedRefill(patient?.profiles?.id, patient?.profiles?.email)
      );
    }
    Promise.allSettled(requests).then(() => {
      updateOnlineVisit(
        {
          status: 'Completed',
          completed_at: new Date().toISOString(),
          intakes: [],
        },
        false
      );
      nextPage();
    });
  }, [
    fetchCareTeam,
    medication?.medication_quantity_id,
    nextPage,
    patient?.canvas_patient_id,
    patient?.id,
    patient?.region,
    nextMed,
    isFetched,
    submitQuestionnaireResponses,
    supabase,
    updateOnlineVisit,
  ]);

  useEffect(() => {
    if (patient?.id && medication?.medication_quantity_id && isFetched) {
      submitRefill();
    }
  }, [patient?.id, medication?.medication_quantity_id, isFetched]);

  return (
    <Container maxWidth="xs">
      <Stack alignItems="center" gap={3}>
        <Loading />
        <Typography variant="h3">Submitting your refill request</Typography>
      </Stack>
    </Container>
  );
};

export default RequestCompoundWeightLossRefill;
