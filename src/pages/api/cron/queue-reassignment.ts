import { Database } from '@/lib/database.types';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
} from 'date-fns';

import { NextApiRequest, NextApiResponse } from 'next';
type Task = Database['public']['Tables']['task_queue']['Row'];

const handleResults = (results: any[]) =>
  results.map(r => {
    if (r.status === 'fulfilled') {
      return r.value;
    }

    return r.reason;
  });

// Retrieve tasks from queue
const getTasksByQueue = async (queueType: string) => {
  let query = supabase
    .from('task_queue')
    .select('*')
    .eq('queue_type', queueType)
    .is('action_taken', null)
    .eq('visible', true)
    .lte('created_at', new Date().toISOString());

  if (queueType !== 'Provider (QA)') {
    query = query.not('assigned_clinician_id', 'is', null);
  }

  return await query.then(({ data }) => (data || []) as Task[]);
};

// Unassign/move task
const handleUnassignmentToQueue = async (queue: string, task: Task) => {
  await supabase
    .from('task_queue')
    .update({
      action_taken: null,
      assigned_clinician_id: null,
      clinician_assigned_at: null,
      queue_type: queue,
    })
    .eq('id', task?.id)
    .throwOnError();

  return `Successfully unassigned ${task.task_type} task: ${task.id} in queue ${queue}`;
};

const handleLeadProviderUnassignment = async (task: Task) => {
  if (
    [
      'PRESCRIPTION_REFILL',
      'PRESCRIPTION_REQUEST',
      'PRIOR_AUTH_APPROVED',
      'UNREAD_MESSAGE',
    ].includes(task?.task_type || '') &&
    differenceInMinutes(new Date(), new Date(task?.created_at)) > 60
  ) {
    return handleUnassignmentToQueue('Lead Provider', task);
  }
};

// Any Provider (QA) task should move to Provider queue after 12 hours
const handleProviderQAUnassignment = async (task: Task) => {
  if (differenceInHours(new Date(), new Date(task?.created_at)) >= 12) {
    console.log(task);
    return handleUnassignmentToQueue('Provider', task);
  }
};

const handleProviderUnassignment = async (task: Task) => {
  if (
    ['PRESCRIPTION_REFILL', 'PRESCRIPTION_REQUEST'].includes(
      task?.task_type || ''
    ) &&
    differenceInDays(new Date(), new Date(task?.created_at)) > 10
  ) {
    return handleUnassignmentToQueue('Lead Provider', task);
  }

  if (
    task?.clinician_assigned_at &&
    task?.task_type === 'SIDE_EFFECT' &&
    differenceInMinutes(new Date(), new Date(task?.clinician_assigned_at)) > 120
  ) {
    return handleUnassignmentToQueue('Provider', task);
  }

  if (
    task?.clinician_assigned_at &&
    task?.task_type === 'PRIOR_AUTH_APPROVED' &&
    differenceInMinutes(new Date(), new Date(task?.clinician_assigned_at)) > 360
  ) {
    return handleUnassignmentToQueue('Provider', task);
  }

  if (
    task?.clinician_assigned_at &&
    task?.task_type === 'PRESCRIPTION_REFILL' &&
    differenceInMinutes(new Date(), new Date(task?.clinician_assigned_at)) > 720
  ) {
    return handleUnassignmentToQueue('Provider', task);
  }

  if (
    task?.clinician_assigned_at &&
    task?.task_type === 'PRESCRIPTION_REQUEST' &&
    differenceInMinutes(new Date(), new Date(task?.clinician_assigned_at)) > 60
  ) {
    return handleUnassignmentToQueue('Provider', task);
  }

  if (
    task?.clinician_assigned_at &&
    task?.task_type === 'UNREAD_MESSAGE' &&
    differenceInMinutes(new Date(), new Date(task?.clinician_assigned_at)) > 240
  ) {
    return handleUnassignmentToQueue('Provider', task);
  }

  if (
    task?.clinician_assigned_at &&
    task?.task_type === 'BLOOD_PRESSURE' &&
    differenceInMinutes(new Date(), new Date(task?.clinician_assigned_at)) > 60
  ) {
    return handleUnassignmentToQueue('Provider', task);
  }

  if (
    task?.clinician_assigned_at &&
    task?.task_type === 'WEIGHT_LOSS_CHECKIN' &&
    differenceInMinutes(new Date(), new Date(task?.clinician_assigned_at)) > 60
  ) {
    // Complete task for user with action_taken of unassigned
    return handleUnassignmentToQueue('Provider', task);
  }

  return `Could not find appropriate condition for task ${task.id}: ${task.task_type} in ${task.queue_type}`;
};

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
  try {
    const [
      incompleteAssignedProviderQATasks,
      incompleteAssignedTasks,
      incompleteAssignedLeadProviderTasks,
    ] = await Promise.all([
      getTasksByQueue('Provider (QA)'),
      getTasksByQueue('Provider'),
      getTasksByQueue('Lead Provider'),
    ]);

    console.log(
      `Processing incompleteAssignedProviderQATasks: ${incompleteAssignedProviderQATasks.length}, incompleteAssignedTasks: ${incompleteAssignedTasks.length}, incompleteAssignedLeadProviderTasks: ${incompleteAssignedLeadProviderTasks.length}`
    );

    const unassignedLead = await Promise.allSettled(
      incompleteAssignedLeadProviderTasks.map(handleLeadProviderUnassignment)
    ).then(handleResults);

    const unassignedProvider = await Promise.allSettled(
      incompleteAssignedTasks.map(handleProviderUnassignment)
    ).then(handleResults);

    const unassignedProviderQA = await Promise.allSettled(
      incompleteAssignedProviderQATasks.map(handleProviderQAUnassignment)
    ).then(handleResults);

    console.log({
      unassignedLead,
      unassignedProvider,
      unassignedProviderQA,
    });

    console.log('ended');
    return res.status(200).json({
      results: {
        unassignedLead,
        unassignedProvider,
        unassignedProviderQA,
      },
    });
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ error: err });
  }
}
