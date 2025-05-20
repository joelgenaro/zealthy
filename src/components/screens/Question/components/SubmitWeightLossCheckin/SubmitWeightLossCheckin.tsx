import { Container } from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { usePatient } from '@/components/hooks/data';
import { useQuestionnaireResponses } from '@/components/hooks/useQuestionnaireResponses';
import { useVisitAsync } from '@/components/hooks/useVisit';
import { useEffect } from 'react';
import { prescriptionRequestedDosageQuarterlyEvent } from '@/utils/freshpaint/events';
import Spinner from '@/components/shared/Loading/Spinner';
import { useMutatePatientActionItems } from '@/components/hooks/useMutatePatientActionItems';

const SubmitWeightLossCheckin = ({
  nextPage,
}: {
  nextPage: (nextPage?: string) => void;
}) => {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const { updateOnlineVisit } = useVisitAsync();
  const submitQuestionnaireResponses = useQuestionnaireResponses();
  const { updateActionItem } = useMutatePatientActionItems();

  //most recent prescription request status not requested or rejected for compound quantity 98 req id

  async function submitResponses() {
    let requests = [];

    const isBundled = await supabase
      .from('patient_subscription')
      .select('*')
      .eq('patient_id', patient?.id!)
      .in('price', [297, 217, 446, 349, 449, 718, 891])
      .then(({ data }) => !!(data || []).length);

    let hasNurseOrder = false;
    if (patient?.region === 'FL') {
      const { data: orderId } = await supabase
        .from('patient_action_item')
        .select('order_id')
        .eq('type', 'COMPOUND_MEDICATION_DOSAGE_UPDATE_REQUEST')
        .eq('patient_id', patient?.id)
        .eq('title', 'Request your weight loss Rx dosage update')
        .eq(
          'body',
          'You should request your dosage update request before completing your last injection of the previous dosage.'
        )
        .eq('path', '/patient-portal/visit/weight-loss-quarterly-checkin')
        .eq('is_required', true)
        .lte('created_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (Array.isArray(orderId) && orderId?.[0]?.order_id) {
        const { data: prescriptionRequestId } = await supabase
          .from('order')
          .select('prescription_request_id')
          .eq('id', orderId[0]?.order_id);

        if (
          Array.isArray(prescriptionRequestId) &&
          prescriptionRequestId?.[0]?.prescription_request_id
        ) {
          const { data: associatedNurseOrder } = await supabase
            .from('clinician_nurse_order')
            .select('id')
            .eq(
              'prescription_request_id',
              prescriptionRequestId[0]?.prescription_request_id
            );
          if (associatedNurseOrder?.length) hasNurseOrder = true;
        }
      }
    }

    requests.push(
      submitQuestionnaireResponses(),
      supabase.from('task_queue').insert({
        task_type: 'WEIGHT_LOSS_CHECKIN',
        patient_id: patient?.id,
        queue_type: hasNurseOrder
          ? 'Nurse Navigator'
          : isBundled
          ? 'Provider (Bundled Trained)'
          : 'Provider',
      }),
      updateActionItem({
        patient_id: patient?.id!,
        completed_at: new Date().toISOString(),
        completed: true,
        type: 'COMPOUND_MEDICATION_DOSAGE_UPDATE_REQUEST',
      }),
      prescriptionRequestedDosageQuarterlyEvent(patient?.profiles?.email!)
    );

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
  }

  useEffect(() => {
    submitResponses();
  }, []);

  return (
    <Container maxWidth="xs">
      <Spinner />
    </Container>
  );
};

export default SubmitWeightLossCheckin;
