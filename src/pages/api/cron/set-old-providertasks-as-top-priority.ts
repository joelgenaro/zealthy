import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';
import { format, subDays } from 'date-fns';
import { NextApiRequest, NextApiResponse } from 'next';

// Handler function to update provider tasks that are older than 7 days to be top priority
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const signature = req.headers['supabase-signature'];
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;

  if (!signature || !secret || signature !== secret) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const providerQueueTypes = [
    'Provider (QA)',
    'Provider (Bundled Trained)',
    'Provider (AMH)',
    'Provider',
    'Lead Provider',
    'Incident Reporting',
  ];

  const BATCH_SIZE = 1000; // Our Supabase Project API's row limit
  let taskIds = [];
  let from = 0;

  while (true) {
    // Need to fetch by batches to update more than 1000 tasks every hour

    // By batches, get all Provider tasks' IDs of incomplete tasks that
    // are between 10/1/24 and 7 days ago
    const { data: tasks, error } = await supabase
      .from('task_queue')
      .select('id')
      .eq('visible', true)
      .is('completed_at', null)
      .in('queue_type', providerQueueTypes)
      .not('patient_id', 'is', 'null')
      .neq('priority_level', 10)
      .or('action_taken.is.null, action_taken.eq.UNASSIGNED')
      .lte(
        'created_at',
        format(subDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm:ssxxx")
      )
      .gte('created_at', '10/1/24')
      .range(from, from + BATCH_SIZE - 1);

    if (error) {
      console.error('Error fetching tasks:', error);
      break;
    }

    // No more tasks left to fetch
    if (tasks?.length === 0 || !tasks) {
      console.log('No more tasks to update...');
      break;
    }

    // Accumulate task IDs
    taskIds.push(...tasks?.map(task => task.id));

    // Move to the next batch
    console.log('moving to next batch...:', from, 'to', from + BATCH_SIZE);
    from += BATCH_SIZE;
  }
  console.log('Length of all old taskIds:', taskIds?.length);

  // Set old tasks to be top priority
  await supabase
    .from('task_queue')
    .update({ priority_level: 10 })
    .in('id', taskIds);

  console.log(
    'Updated Provider tasks older than 7 days to be top priority. Sending response...'
  );
  res.status(200).json({ status: 'Success!', taskIds: taskIds.length });
}
