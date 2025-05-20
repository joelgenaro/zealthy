import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import addDays from 'date-fns/addDays';
import {
  createBundleRefillTask,
  createDosageUpdateTask,
  createRefillTask,
} from './createActionItem';
import { findActionItem } from './helpers';
import { NonNullableOrder } from './types';

type AddActionItemParams = {
  actionItem: Database['public']['Tables']['patient_action_item']['Insert'];
  patientId: number;
  medication: string;
  orderId: number;
};

const addActionItem = async ({
  actionItem,
  patientId,
  medication,
  orderId,
}: AddActionItemParams) => {
  const currentActionItem = await findActionItem(patientId, actionItem.type);

  if (currentActionItem) {
    console.log({
      message: `${currentActionItem.type} action item already exist for patient ${patientId}. Returning...`,
    });
    return;
  }

  console.log({
    message: `Creating action item ${actionItem.type} for dose: ${medication}, order: ${orderId}.`,
  });

  await supabaseAdmin
    .from('patient_action_item')
    .insert(actionItem)
    .throwOnError();

  return;
};

type OrderActionItemParams = {
  order: NonNullableOrder;
  isBundled: boolean;
  medication: string;
  createdAt: string;
};

const handleRequestRefillActionItem = ({
  order,
  isBundled,
  medication,
  createdAt,
}: OrderActionItemParams) => {
  if (isBundled) {
    return createBundleRefillTask({
      patientId: order.patient_id,
      createdAt: createdAt,
      medication: medication,
    });
  }

  return createRefillTask({
    patientId: order.patient_id,
    createdAt: createdAt,
  });
};

export const handleActionItem = async (order: NonNullableOrder) => {
  try {
    const [prescription, subscription] = await Promise.all([
      supabaseAdmin
        .from('prescription')
        .select('*')
        .eq('id', order.prescription_id)
        .throwOnError()
        .maybeSingle()
        .then(({ data }) => data),

      supabaseAdmin
        .from('patient_subscription')
        .select('*, subscription!inner(*)')
        .eq('patient_id', order.patient_id)
        .ilike('subscription.name', '%weight loss%')
        .eq('status', 'active')
        .eq('visible', true)
        .throwOnError()
        .then(({ data }) => data || []),
    ]);

    if (!prescription || !prescription.medication) {
      throw new Error(
        `Could not found prescription for id: ${order.prescription_id} or medication column was empty`
      );
    }

    if (subscription.length !== 1) {
      throw new Error(
        `Could not find or found to many weight subscriptions for patient ${order.patient_id}`
      );
    }

    const createdAt = addDays(new Date(), 21).toISOString();

    if (
      order.total_dose === null ||
      prescription.medication === order.total_dose
    ) {
      console.log({
        message: `Order total dose is null or medication in prescription is equal order total dose: ${prescription.medication}`,
      });

      const actionItem = handleRequestRefillActionItem({
        order,
        isBundled: [449, 297].includes(subscription[0].price || 0),
        medication: prescription.medication.split(' ')[0],
        createdAt,
      });

      await addActionItem({
        actionItem,
        patientId: order.patient_id,
        medication: prescription.medication,
        orderId: order.id,
      });

      return;
    }

    console.log({
      message: `Prescription medication is NOT equal order total dose: medication: ${prescription.medication}, total dose: ${order.total_dose}`,
    });

    const moreOrders = await supabaseAdmin
      .from('order')
      .select('id')
      .eq('patient_id', order.patient_id)
      .eq('total_dose', order.total_dose)
      .neq('id', order.id)
      .gte('created_at', order.created_at)
      .then(({ data }) => data || []);

    let actionItem:
      | Database['public']['Tables']['patient_action_item']['Insert']
      | null = null;

    if (moreOrders.length > 0) {
      actionItem = createDosageUpdateTask({
        patientId: order.patient_id,
        createdAt: createdAt,
      });
    } else {
      actionItem = handleRequestRefillActionItem({
        order,
        isBundled: [449, 297].includes(subscription[0].price || 0),
        medication: prescription.medication.split(' ')[0],
        createdAt,
      });
    }

    await addActionItem({
      actionItem,
      patientId: order.patient_id,
      medication: order.total_dose,
      orderId: order.id,
    });

    return;
  } catch (err) {
    throw err;
  }
};
