import { Database } from '@/lib/database.types';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useCallback, useEffect } from 'react';
import {
  PrescriptionRequestProps,
  useAllVisiblePatientSubscription,
  usePatient,
} from '@/components/hooks/data';

import { useIntakeState } from '@/components/hooks/useIntake';
import { useVisitSelect } from '@/components/hooks/useVisit';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { prescriptionRequestedEvent } from '@/utils/freshpaint/events';
import medicationAttributeName from '@/utils/medicationAttributeName';

type UpdatePrescriptionOptions = {
  newPRStatus: string;
  task: Database['public']['Tables']['task_queue']['Insert'];
};

const AmhMessageEffect = () => {
  console.log('in amhmessageeffect');
  const supabase = useSupabaseClient<Database>();
  const visit_id = useVisitSelect(visit => visit.id);
  const { specificCare, potentialInsurance } = useIntakeState();
  const { data: subscriptions } = useAllVisiblePatientSubscription();
  const { data: patient } = usePatient();

  const updatePrescriptionRequest = useCallback(
    async (options: UpdatePrescriptionOptions) => {
      console.log('in amhmessageeffect prcall');
      return supabase
        .from('prescription_request')
        .update({
          status: options.newPRStatus,
        })
        .eq('status', 'PRE_INTAKES')
        .eq('patient_id', patient!.id)
        .select('*')
        .then(({ data }) => (data || []) as PrescriptionRequestProps[])
        .then(async req => {
          await Promise.all(
            req.map(async r => {
              const addToQueue = await supabase
                .from('task_queue')
                .insert(options.task)
                .select()
                .maybeSingle()
                .throwOnError()
                .then(({ data }) => data);
              await supabase
                .from('prescription_request')
                .update({ queue_id: addToQueue?.id })
                .eq('id', r?.id)
                .throwOnError();

              prescriptionRequestedEvent(
                patient?.profiles?.email!,
                medicationAttributeName(r.specific_medication || '') || r.note!,
                ''
              );
            })
          );
          return req;
        });
    },

    [patient?.id, patient?.profiles?.email, supabase]
  );

  const handleRequestTask = useCallback(
    async (patient_id: number) => {
      if (!specificCare || !patient_id) return;
      const isAMH = specificCare === SpecificCareOption.ASYNC_MENTAL_HEALTH;
      if (isAMH) {
        try {
          await updatePrescriptionRequest({
            newPRStatus: patient?.has_verified_identity
              ? 'REQUESTED'
              : 'REQUESTED - ID must be uploaded',
            task: {
              task_type: patient?.has_verified_identity
                ? 'PRESCRIPTION_REQUEST'
                : 'PRESCRIPTION_REQUEST_ID_REQUIRED',
              patient_id: patient?.id,
              queue_type: 'Provider (AMH)',
              note: patient?.has_verified_identity
                ? ''
                : "This patient has not uploaded ID. Please proceed as normal, write a clinical note and approve request if eligible. The order will not be dispensed until the patient's ID is verified.",
            },
          });

          if (visit_id) {
            await supabase
              .from('online_visit')
              .update({ requested_prescription: true })
              .eq('id', visit_id);
          }
        } catch (e) {
          console.error(e);
        }
      }
    },
    [
      patient,
      potentialInsurance,
      specificCare,
      subscriptions,
      supabase,
      updatePrescriptionRequest,
    ]
  );

  useEffect(() => {
    if (specificCare !== 'Mental health' || !patient?.id) return;
    console.log('in amhmessageeffect effect', { specificCare, patient });
    handleRequestTask(patient.id);
  }, [specificCare, patient]);

  useEffect(() => {
    if (specificCare !== 'Anxiety or depression' || !patient?.id) return;
    handleAddPrescriptionRequest(patient.id);
  }, [specificCare, patient]);

  const handleAddPrescriptionRequest = useCallback(
    async (patient_id: number) => {
      if (!specificCare || !patient_id) return;
      const isPsychiatry =
        specificCare === SpecificCareOption.ANXIETY_OR_DEPRESSION;
      if (isPsychiatry) {
        try {
          const prescriptionTask = await supabase
            .from('task_queue')
            .insert({
              patient_id,
              task_type: 'PRESCRIPTION_REQUEST',
              priority_level: 0,
              queue_type: 'Provider (QA)',
            })
            .select()
            .maybeSingle()
            .then(({ data }) => data);

          const { data, error } = await supabase
            .from('prescription_request')
            .insert({
              patient_id,
              status: 'REQUESTED',
              region: patient?.region,
              shipping_method: 1,
              note: 'Patient requested Mental Health Medication',
              queue_id: prescriptionTask?.id,
              type: 'Personalized Psychiatry',
              charge: true,
              quantity: 30,
            })
            .select()
            .maybeSingle();
        } catch (err) {
          console.error(err);
        }
      }
    },
    []
  );

  return null;
};

export default AmhMessageEffect;
