import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseWebhookHandlerWrapper } from '../../wrappers/supabaseWebhookWrapper';
import { handleConfirmedAppointment } from './_utils/handleConfirmedAppointment';

type Appointment = Database['public']['Tables']['appointment']['Row'];
type TaskCreateInput = Database['public']['Tables']['task_queue']['Insert'];

const handleWalkedInAppointment = async (appointment: Appointment) => {
  const isBundled = await supabaseAdmin
    .from('patient_subscription')
    .select('patient_id')
    .eq('patient_id', appointment.patient_id)
    .in('price', [297, 217, 446, 349, 449, 718, 891])
    .then(({ data }) => !!(data || []).length);

  const options: TaskCreateInput = {
    task_type: 'VIDEO_VISIT_WITH_PROVIDER',
    queue_type: 'Provider (QA)',
    patient_id: appointment.patient_id,
    note: 'Video visit with patient',
    priority_level: 10,
    skip_to_front_at: new Date().toISOString(),
  };

  const pendingPrescriptionRequest = await supabaseAdmin
    .from('prescription_request')
    .select('id')
    .eq('patient_id', appointment.patient_id)
    .eq('status', 'REQUESTED')
    .throwOnError()
    .then(({ data }) => data || []);

  if (pendingPrescriptionRequest.length) {
    options.note = '';
  }

  const taskId = await supabaseAdmin
    .from('task_queue')
    .insert(options)
    .select('id')
    .throwOnError()
    .maybeSingle()
    .then(({ data }) => data?.id);

  if (!taskId) {
    throw new Error(
      `Could not create task VIDEO_VISIT_WITH_PROVIDER for appointment: ${appointment.id}`
    );
  }

  await supabaseAdmin
    .from('appointment')
    .update({
      queue_id: taskId,
    })
    .eq('id', appointment.id)
    .throwOnError();

  return;
};

type InsertPayload = {
  type: 'INSERT';
  table: string;
  schema: string;
  record: Appointment;
  old_record: null;
};

const handleAppointmentCreation = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { record } = req.body as InsertPayload;

  try {
    if (record.status === 'Confirmed') {
      await handleConfirmedAppointment(record);
    }

    if (
      record.status === 'Unassigned' &&
      record.encounter_type === 'Walked-in'
    ) {
      await handleWalkedInAppointment(record);
    }
  } catch (err: any) {
    console.error(err);
    res.status(422).json({
      error: err?.message || 'There was an unexpected error',
    });
  }
};

export default async function CreateAppointment(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return supabaseWebhookHandlerWrapper(req, res, handleAppointmentCreation);
}
