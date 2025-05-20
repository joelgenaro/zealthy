import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { addMinutes, subMinutes } from 'date-fns';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const signature = req.headers['supabase-signature'];
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;
  // console.log('Received request with signature:', signature);
  if (!signature || !secret || signature !== secret) {
    console.log('Unauthorized request');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Cases that require action but do not have an incomplete task attached
  const cases = await supabaseAdmin
    .from('prior_auth')
    .select('*, task_queue!inner(*)')
    .not('queue_id', 'is', null)
    .not('dosespot_prior_authorization_case_id', 'is', null)
    .eq('status', 'ActionRequired')
    .not('queue_id', 'is', null)
    .not('patient_id', 'is', null)
    .gt('task_queue.created_at', '3/30/2025')
    .not('task_queue.completed_at', 'is', null)
    .eq('task_queue.action_taken', 'COMPLETED')
    .lt('task_queue.completed_at', subMinutes(new Date(), 60).toISOString());

  console.log(cases.data);
  console.log(cases.data?.length);

  if (cases.data) {
    const newCases = await Promise.allSettled(
      cases.data.map(async c => {
        const newTask = await supabaseAdmin
          .from('task_queue')
          .insert({
            patient_id: c?.patient_id,
            task_type: 'PRIOR_AUTH_SUBMITTED',
            queue_type: 'Coordinator',
          })
          .select('*')
          .single();

        return await supabaseAdmin
          .from('prior_auth')
          .update({ queue_id: newTask.data?.id })
          .eq('id', c.id);
      })
    );
    console.log('UPDATED CASES', newCases);
  }

  res.status(200).send('OK');
}
