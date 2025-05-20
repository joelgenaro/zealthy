import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { subDays, subHours } from 'date-fns';
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

  const thirtySixHoursAgo = subHours(new Date(), 36).toISOString();
  const oneMonthAgo = subDays(new Date(), 30).toISOString();

  const incompleteTasks = await supabaseAdmin
    .from('task_queue')
    .select('*')
    .lt('created_at', thirtySixHoursAgo)
    .gt('created_at', oneMonthAgo)
    // Everything but prescription tasks
    .not(
      'task_type',
      'in',
      `(${[
        'PRESCRIPTION_REQUEST',
        'PRESCRIPTION_REFILL',
        'PRESCRIPTION_REQUEST_ID_REQUIRED',
        'PRESCRIPTION_REQUEST_PREP',
      ]})`
    )
    .is('action_taken', null)
    .eq('visible', true)
    .eq('queue_type', 'Provider')
    .limit(50)
    .then(data => data.data);

  if (!incompleteTasks || incompleteTasks?.length === 0) {
    return res.status(200).send('OK');
  }

  const taskIds = incompleteTasks.map(task => task.id);
  const taskTypes = new Set(incompleteTasks.map(task => task.task_type));

  const { error, data } = await supabaseAdmin
    .from('task_queue')
    .update({
      queue_type: 'Coordinator',
      priority_level: 1,
      note: 'This task was sent to the providers but was not completed.',
      skip_to_front_at: new Date().toISOString(),
    })
    .in('id', taskIds)
    .select('*');

  if (error) {
    res.status(500).json({
      error: 'Something happened while updating these tasks.',
    });
  }

  console.log(data, 'UPDATED TASKS');

  console.log(taskTypes);
  res.status(200).send('OK');
}
