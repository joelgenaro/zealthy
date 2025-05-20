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

  const unreadMessageTasks = await supabaseAdmin
    .from('task_queue')
    .select('*')
    .lt('created_at', thirtySixHoursAgo)
    .gt('created_at', oneMonthAgo)
    .eq('task_type', 'UNREAD_MESSAGE')
    .is('action_taken', null)
    .eq('visible', true)
    .ilike('queue_type', '%Provider%')
    .neq('queue_type', 'Provider Support')
    .limit(50)
    .then(data => data.data);

  if (!unreadMessageTasks || unreadMessageTasks?.length === 0) {
    return res.status(200).send('OK');
  }

  const queueTypes = Array.from(
    new Set(unreadMessageTasks.map(task => task.queue_type))
  );

  const taskIds = unreadMessageTasks.map(task => task.id);

  const { error, data } = await supabaseAdmin
    .from('task_queue')
    .update({
      queue_type: 'Coordinator',
      priority_level: 1,
      note: 'This message was sent to the providers but was not answered.',
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

  console.log(queueTypes);
  res.status(200).send('OK');
}
