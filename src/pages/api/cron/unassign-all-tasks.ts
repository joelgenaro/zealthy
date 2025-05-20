import { subDays } from 'date-fns';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
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
  const date = subDays(new Date(), 2).toISOString();
  console.log(date);
  const incompletedTasks = await supabaseAdmin
    .from('task_queue')
    .select('*')
    .neq('queue_type', 'Coach')
    .is('action_taken', null)
    .or('clinician_assigned_at.lte.' + date + ',clinician_assigned_at.is.null')
    .not('assigned_clinician_id', 'is', null)
    .then(({ data }) => data || []);
  console.log(incompletedTasks);

  const unassignedTasks = await supabaseAdmin
    .from('task_queue')
    .update({ assigned_clinician_id: null, clinician_assigned_at: null })
    .in(
      'id',
      incompletedTasks.map(task => task.id)
    )
    .select('*');
  console.log(unassignedTasks);
  console.log(
    'AFFECTED QUEUES: ',
    Array.from(new Set(unassignedTasks.data?.map(task => task.queue_type)))
  );

  res.status(200).json({ tasks: unassignedTasks });
}
