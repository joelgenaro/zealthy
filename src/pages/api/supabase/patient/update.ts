import { Database } from '@/lib/database.types';
import { getKeys } from '@/utils/getKeys';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseWebhookHandlerWrapper } from '../../wrappers/supabaseWebhookWrapper';
import { handleActivePatient } from './_utils/handleActivePatient';
import { handleWeightLossMedicationEligibility } from './_utils/handleWeightLossMedicationEligibility';
import { handleGLP1Eligibility } from './_utils/handleGLP1Eligibility';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { PatientStatus } from '@/context/AppContext/reducers/types/patient';
import { stateToTimezone } from '../../twilio/mapStateToTimezone';

type Patient = Database['public']['Tables']['patient']['Row'];

const handleBundleActivePatient = async (patientId: number) => {
  const isBundled = await supabaseAdmin
    .from('patient_subscription')
    .select('*')
    .eq('patient_id', patientId)
    .in('price', [249, 297, 217, 446, 349, 449, 718, 891])
    .then(({ data }) => !!(data || []).length);

  if (isBundled) {
    await supabaseAdmin
      .from('patient')
      .update({ insurance_skip: true })
      .eq('id', patientId);
  }
};

type UpdatePayload = {
  type: 'UPDATE';
  table: string;
  schema: string;
  record: Patient;
  old_record: Patient;
};

const handleUpdatePatient = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { record, old_record } = req.body as UpdatePayload;

    const changedAttributes = getKeys(old_record).filter(
      key => old_record[key] !== record[key]
    );

    console.log({
      message: `Patient: ${
        record.id
      } has been updated with ${changedAttributes.join(', ')}`,
      zealthy_patient_id: record.id,
    });

    const prescRequests = await supabaseAdmin
      .from('prescription_request')
      .select('*, task_queue!inner(*)')
      .eq('patient_id', record.id)
      .eq('is_visible', true)
      .not('queue_id', 'is', null)
      .eq('task_queue.action_taken', 'COMPLETED')
      .then(data => data.data);
    if (
      record.has_verified_identity &&
      changedAttributes.includes('has_verified_identity')
    ) {
      prescRequests?.map(async pr => {
        const newTask = await supabaseAdmin
          .from('task_queue')
          .insert({
            patient_id: record.id,
            queue_type: 'Provider (QA)',
            task_type: 'PRESCRIPTION_REQUEST',
            priority_level: 10,
            note:
              pr.status === 'APPROVED - Pending ID'
                ? 'This prescription request has already been approved but was not dispensed because ' +
                  'the patient did not verify their identification. The patient has now verified their ID,' +
                  ' please ensure that the request is prescribed / dispensed for the patient if you agree with the previous medical provider who had approved it.'
                : 'This prescription request was not previously fully addressed because the patient had not verified their identification. ' +
                  'The patient has now verified their ID, so please review the request now as if it were new.',
          })
          .select()
          .single();
        return await supabaseAdmin
          .from('prescription_request')
          .update({ queue_id: newTask.data?.id, status: 'REQUESTED' })
          .eq('id', pr.id)
          .select()
          .single()
          .then(data => data.data?.id);
      });
    }

    if (
      changedAttributes.includes('status') &&
      record.status === PatientStatus.ACTIVE
    ) {
      await Promise.allSettled([
        handleActivePatient(record),
        handleBundleActivePatient(record.id),
      ]);
    }

    if (
      changedAttributes.includes('weight_loss_medication_eligible') &&
      record.weight_loss_medication_eligible === false
    ) {
      await handleWeightLossMedicationEligibility(record);
    }

    if (
      changedAttributes.includes('glp1_ineligible') &&
      record.glp1_ineligible === true
    ) {
      await handleGLP1Eligibility(record);
    }

    if (changedAttributes.includes('region')) {
      const timezone =
        stateToTimezone[record.region as keyof typeof stateToTimezone];
      console.log(
        'UPDATING PATIENT TIMEZONE TO ' + timezone + ' FOR PATIENT ' + record.id
      );
      await supabaseAdmin
        .from('patient')
        .update({ timezone: timezone })
        .eq('id', record.id);
    }

    res.status(200).json({ message: 'OK' });
  } catch (err: any) {
    console.error(err);
    res.status(422).json({
      error: err?.message || 'There was an unexpected error',
    });
  }
};

export default async function UpdateOrder(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return supabaseWebhookHandlerWrapper(req, res, handleUpdatePatient);
}
