import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Order = Database['public']['Tables']['order']['Row'];

export const updateNextRefillCreatedAtDate = async (order: Order) => {
  if (!order.prescription_id) {
    throw new Error(`Order ${order.id} does not have prescription id`);
  }

  try {
    const refill = await supabaseAdmin
      .from('order')
      .select('*')
      .eq('prescription_id', order.prescription_id)
      .ilike('order_status', '%PREPAID_REFILL%')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => data as Order | null);

    if (refill) {
      const after = new Date();
      after.setDate(after.getDate() + 21);

      console.log('updating_refill', {
        message: `Updating refill for order ${
          refill.id
        } with created_at date as: ${after.toLocaleString()}`,
      });

      await supabaseAdmin
        .from('order')
        .update({
          created_at: after.toISOString(),
        })
        .eq('id', refill.id);
    }
  } catch (err) {
    throw err;
  }
};
