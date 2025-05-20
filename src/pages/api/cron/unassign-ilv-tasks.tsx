import { subDays, subMinutes } from 'date-fns';
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
  const tenMinAgo = subMinutes(new Date(), 10).toISOString();
  const fiveMinAgo = subMinutes(new Date(), 5).toISOString();
  console.log(tenMinAgo, fiveMinAgo);
  const incompleteIlvTasks = await supabaseAdmin
    .from('task_queue')
    .select('*, appointment!inner(*)')
    .eq('task_type', 'VIDEO_VISIT_WITH_PROVIDER')
    .eq('visible', true)
    .is('action_taken', null)
    .in('appointment.status', ['Confirmed', 'Provider-Noshowed'])
    .lt('clinician_assigned_at', tenMinAgo)
    .or(`provider_left_at.is.null,provider_left_at.lt.${fiveMinAgo}`, {
      referencedTable: 'appointment',
    })
    .not('assigned_clinician_id', 'is', null)
    .then(({ data }) => data || []);
  console.log(incompleteIlvTasks);

  const unassignedTasks = await supabaseAdmin
    .from('task_queue')
    .update({ assigned_clinician_id: null, clinician_assigned_at: null })
    .in(
      'id',
      incompleteIlvTasks.map(task => task.id)
    )
    .select('*');
  console.log(unassignedTasks);

  res.status(200).json({ tasks: unassignedTasks });
}
