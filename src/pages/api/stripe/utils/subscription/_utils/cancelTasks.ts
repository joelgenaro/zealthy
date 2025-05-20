import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const cancelTasks = async (patientId: number) => {
  console.log(`Patient: ${patientId} in cancel tasks`);

  const incompleteTasks = await supabaseAdmin
    .from('task_queue')
    .select('id')
    .eq('patient_id', patientId)
    .eq('visible', true)
    .is('completed_at', null)
    .then(({ data }) => data || [])
    .then(data => data.map(item => item.id));

  if (incompleteTasks?.length) {
    await supabaseAdmin
      .from('task_queue')
      .update({ visible: false })
      .in('id', incompleteTasks)
      .select()
      .then(tasks => console.log('CANCELED_TASKS: ', tasks));
  }
};
