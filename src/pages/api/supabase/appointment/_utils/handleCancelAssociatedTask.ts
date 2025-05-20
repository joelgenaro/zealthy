import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Appointment = Database['public']['Tables']['appointment']['Row'];

export const handleCancelAssociatedTask = async (appointment: Appointment) => {
  if (!appointment.queue_id) {
    return;
  }

  await supabaseAdmin
    .from('task_queue')
    .update({
      visible: false,
    })
    .eq('id', appointment.queue_id)
    .throwOnError();

  return;
};
