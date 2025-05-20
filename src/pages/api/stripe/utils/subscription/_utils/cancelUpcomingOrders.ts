import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const cancelUpcomingOrders = (patientId: number) => {
  return supabaseAdmin
    .from('order')
    .update({
      order_status: 'CANCELLED',
    })
    .eq('patient_id', patientId)
    .in('order_status', [
      'PREPAID_REFILL_1',
      'PREPAID_REFILL_2',
      'PREPAID_REFILL_3',
      'BUNDLED_REFILL_1',
      'BUNDLED_REFILL_2',
      'BUNDLED_REFILL_3',
    ]);
};
