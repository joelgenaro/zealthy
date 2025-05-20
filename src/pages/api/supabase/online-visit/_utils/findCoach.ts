import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { format, subMonths } from 'date-fns';

async function handleNextCoach(type: string) {
  let leastPatients: { clinician: any | null; earliest: Date } = {
    clinician: null,
    earliest: subMonths(new Date(), 3),
  };
  const allCoaches = await supabaseAdmin
    .from('clinician')
    .select('*, profiles (*)')
    .eq('status', 'ON')
    .contains('type', [`Coach (${type})`]);

  for (const c of allCoaches?.data || []) {
    const oldestTasks = await supabaseAdmin
      .from('task_queue')
      .select('*')
      .eq('assigned_clinician_id', c.id)
      .is('forwarded_clinician_id', null)
      .eq('visible', true)
      .is('completed_at', null)
      .lte('created_at', format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx"))
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => data);

    if (
      leastPatients.earliest < new Date(oldestTasks?.created_at!) ||
      !oldestTasks
    ) {
      leastPatients = {
        clinician: c || null,
        earliest: !oldestTasks
          ? new Date()
          : new Date(oldestTasks?.created_at!),
      };
    }
  }

  return { clinician: leastPatients.clinician };
}

export const findCoach = async (foundCoach: any, type: string) => {
  if (!foundCoach) {
    return handleNextCoach(type);
  } else {
    return supabaseAdmin
      .from('clinician')
      .select('*, profiles (*)')
      .eq('id', foundCoach?.clinician_id)
      .single()
      .then(({ data }) => {
        return { clinician: data, total: 1 };
      });
  }
};
