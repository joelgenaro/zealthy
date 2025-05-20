import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Order = Database['public']['Tables']['order']['Row'];

export const handleSendToPharmacy = async (order: Order) => {
  const prescriptionInfo = await supabaseAdmin
    .from('prescription')
    .select('pharmacy')
    .eq('id', order.prescription_id!)
    .throwOnError()
    .maybeSingle()
    .then(({ data }) => data);

  await supabaseAdmin
    .from('order')
    .update({
      sent_to_pharmacy_at: new Date().toISOString(),
      order_status: `SENT_TO_${prescriptionInfo?.pharmacy?.toUpperCase()}`,
    })
    .eq('id', order.id);

  const isBundled = await supabaseAdmin
    .from('patient_subscription')
    .select('patient_id')
    .eq('patient_id', order.patient_id!)
    .in('price', [297, 217, 446, 349, 449, 718, 891])
    .then(({ data }) => !!(data || []).length);

  if (isBundled) {
    console.log({
      message: `Order ${order.patient_id} is for Bundled patient. Returning...`,
    });

    return;
  }

  if (order.amount_paid && order.amount_paid > 0) {
    console.log({
      message: `Order: ${order.id} has invoice. Returning...`,
    });

    return;
  }

  if (order.order_without_charge) {
    console.log({
      message: `Order: ${order.id} was prescribed without pay. Returning...`,
    });

    return;
  }

  if (!order.group_id) {
    throw new Error('Missing group id from order');
  }
  const groupOrders = await supabaseAdmin
    .from('order')
    .select('id, amount_paid, prescription_id')
    .eq('group_id', order.group_id)
    .order('id', { ascending: true })
    .throwOnError()
    .then(({ data }) => data || []);

  if (!groupOrders.length) {
    throw new Error(`Could not find orders for group id: ${order.group_id}`);
  }

  if (
    groupOrders.reduce((acc, item) => (acc += item.amount_paid || 0), 0) > 0
  ) {
    console.log({
      message: `One or more of the group orders have amount_paid > 0`,
    });
    return;
  }

  //check if we have an escalation for that order
  const escalation = await supabaseAdmin
    .from('pharmacy_escalation')
    .select('id, order_id')
    .in(
      'order_id',
      groupOrders.map(o => o.id)
    )
    .throwOnError()
    .then(({ data }) => data || []);

  if (escalation.length) {
    console.log({
      message: `Looks like escalation for orders ${escalation
        .map(e => e.id)
        .join(', ')} is already exists`,
    });
    return;
  }

  const task = await supabaseAdmin
    .from('task_queue')
    .insert({
      task_type: 'PHARM_ESC_INIT',
      patient_id: order.patient_id,
      queue_type: 'Coordinator',
      priority_level: 0,
      note: 'Check if order has been paid by patient',
    })
    .select('id')
    .throwOnError()
    .maybeSingle()
    .then(({ data }) => data);

  const firstOrder = groupOrders[0];

  if (!task) {
    throw new Error(
      `Could not create task PHARM_ESC_INIT for patient: ${order.patient_id}`
    );
  }

  // check if order has invoice and if does not - create escalation
  if (!firstOrder.prescription_id) {
    throw new Error(`Order: ${firstOrder.id} does not have prescription`);
  }

  const prescription = await supabaseAdmin
    .from('prescription')
    .select('pharmacy')
    .eq('id', firstOrder.prescription_id)
    .throwOnError()
    .maybeSingle()
    .then(({ data }) => data);

  if (!prescription) {
    throw new Error(
      `Could not find prescription for ID: ${firstOrder.prescription_id}`
    );
  }

  await supabaseAdmin.from('pharmacy_escalation').insert({
    status: 'Initiate Escalation',
    note: 'Check if order has been paid by patient',
    order_id: firstOrder.id,
    issue: 'Pending Clarification',
    patient_id: order.patient_id,
    pharmacy: prescription.pharmacy,
    queue_id: task.id,
  });

  return;
};
