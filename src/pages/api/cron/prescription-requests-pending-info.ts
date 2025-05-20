import { subDays } from 'date-fns';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const signature = req.headers['supabase-signature'];
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;
  if (!signature || !secret || signature !== secret) {
    console.log('Unauthorized request');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const start = subDays(new Date(), 7);

    console.log({ START: start });

    const prescriptionRequests = await supabaseAdmin
      .from('prescription_request')
      .select('id, patient_id, task_queue!inner(*)')
      .eq('status', 'PENDING MEDICAL INFORMATION')
      .eq('task_queue.action_taken', 'COMPLETED')
      .gte('created_at', start.toISOString())
      .throwOnError()
      .then(({ data }) => data || []);

    console.log(
      `Processing: ${prescriptionRequests.length} prescription requests`
    );

    if (prescriptionRequests.length === 0) {
      return res
        .status(200)
        .json({ status: 'No prescription requests found.' });
    }

    const promises = prescriptionRequests.map(async p => {
      const subscriptions = await supabaseAdmin
        .from('patient_subscription')
        .select('reference_id')
        .eq('patient_id', p.patient_id!)
        .in('status', ['active', 'trialing'])
        .then(({ data }) => data || []);

      if (!subscriptions.length) {
        return `Patient ${p.patient_id} does not have any active subscriptions`;
      }

      const task = await supabaseAdmin
        .from('task_queue')
        .insert({
          task_type: p.task_queue.task_type,
          patient_id: p.patient_id,
          queue_type: p.task_queue.queue_type,
          note:
            'Please contact the patient and let them know there is still information needed in order to make a clinical decision. ' +
            p.task_queue.note,
        })
        .select('id')
        .maybeSingle()
        .then(({ data }) => data);

      await supabaseAdmin
        .from('prescription_request')
        .update({
          queue_id: task?.id,
        })
        .eq('id', p.id);

      return `Created task: ${task?.id} for prescription request: ${p.id}`;
    });

    const result = await Promise.allSettled(promises).then(results =>
      results.map(r => {
        if (r.status === 'fulfilled') {
          return r.value;
        }

        return r.reason;
      })
    );

    console.log({ result });

    res.status(200).json({ result });
  } catch (err) {
    console.log({ ERROR: err });
    return res.status(500).json({ error: err });
  }
}
