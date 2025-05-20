import { Database } from '@/lib/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

export async function findPaidOrdersWithoutTracking(
  supabase: SupabaseClient<Database>,
  from?: Date,
  to = new Date()
) {
  const query = supabase
    .from('order')
    .select('*')
    .or('order_status.eq.PAYMENT_SUCCESS,order_status.like.SENT_TO_%')
    .is('tracking_number', null);

  if (from) {
    query.gte('created_at', from.toISOString());
  }

  if (to) {
    query.lte('created_at', to.toISOString());
  }

  return (await query).data || [];
}
