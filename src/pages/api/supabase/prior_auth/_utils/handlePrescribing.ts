import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { PriorAuth } from '@/components/hooks/data';

const createProviderTask = async (priorAuth: PriorAuth) => {
  console.log({
    message: `Creating Task: PRIOR_AUTH_APPROVED for patient: ${priorAuth.patient_id}`,
  });

  if (!priorAuth.patient_id) {
    throw new Error('Prior auth missing patient id');
  }

  const isBundled = await supabaseAdmin
    .from('patient_subscription')
    .select('patient_id')
    .eq('patient_id', priorAuth.patient_id)
    .in('price', [297, 217, 446, 349, 449, 718, 891])
    .then(({ data }) => !!(data || []).length);

  const insertOptions: Database['public']['Tables']['task_queue']['Insert'] = {
    task_type: 'PRIOR_AUTH_APPROVED',
    patient_id: priorAuth.patient_id,
    queue_type: 'Provider',
  };

  const task = await supabaseAdmin
    .from('task_queue')
    .insert(insertOptions)
    .select('id')
    .throwOnError()
    .maybeSingle()
    .then(({ data }) => data);

  if (task) {
    await supabaseAdmin
      .from('prior_auth')
      .update({ queue_id: task.id })
      .eq('id', priorAuth.id);
  }

  return;
};

const createNewPrescriptionRequest = async (priorAuth: PriorAuth) => {
  if (!priorAuth.patient_id) {
    throw new Error(
      `Patient id was not provided in priorAuth: ${priorAuth.id}`
    );
  }

  const patientRegion = await supabaseAdmin
    .from('patient')
    .select('region')
    .eq('id', priorAuth.patient_id)
    .throwOnError()
    .maybeSingle()
    .then(({ data }) => data?.region);

  return supabaseAdmin
    .from('prescription_request')
    .insert({
      status: 'REQUESTED - PA Approved',
      medication_quantity_id: 124,
      patient_id: priorAuth.patient_id,
      specific_medication: priorAuth.rx_submitted,
      quantity: 1,
      region: patientRegion,
      note: `The prior auth for ${priorAuth.rx_submitted} has been approved and the patient has paid the necessary membership to get their medication sent to the pharmacy. Assuming clinically appropriate (which this has already been reviewed by another provider and deemed clinically appropriate), prescribe to local pharmacy and send macro telling patient you have prescribed and should be ready to to pick up at the pharmacy.`,
    })
    .select('id')
    .throwOnError();
};

export const handlePrescribing = async (priorAuth: PriorAuth) => {
  return Promise.allSettled([
    //create task for provider to prescribe
    createProviderTask(priorAuth),
    //create new prescription requests
    createNewPrescriptionRequest(priorAuth),
  ]);
};
