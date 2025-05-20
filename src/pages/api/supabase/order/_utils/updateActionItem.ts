import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { addDays } from 'date-fns';
import sortBy from 'lodash/sortBy';

type Order = Database['public']['Tables']['order']['Row'];

const processOrder = async (order: Order, index: number) => {
  const actionItem = await supabaseAdmin
    .from('patient_action_item')
    .select('*')
    .eq('order_id', order.id)
    .throwOnError()
    .maybeSingle()
    .then(({ data }) => data);

  if (!actionItem) {
    throw new Error(`Could not find action item for order: ${order.id}`);
  }

  await supabaseAdmin.from('patient_action_item').update({
    ...actionItem,
    created_at: addDays(new Date(), 30 * index + 21).toISOString(),
  });
};

export const updateActionItem = async (order: Order) => {
  try {
    const moreOrders = await supabaseAdmin
      .from('order')
      .select('*')
      .eq('created_at', order.created_at!)
      .eq('patient_id', order.patient_id!)
      .throwOnError()
      .then(({ data }) => data || []);

    const orders = sortBy([order].concat(moreOrders), 'id');

    await Promise.all(orders.map(processOrder));
  } catch (err) {
    throw err;
  }
};
