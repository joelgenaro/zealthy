import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import isAfter from 'date-fns/isAfter';
import { PriorAuth } from '@/components/hooks/data';

type Order = Pick<
  Database['public']['Tables']['order']['Row'],
  'created_at' | 'tracking_number'
>;
type Prescription = Pick<
  Database['public']['Tables']['prescription']['Row'],
  'pharmacy'
>;

type PatientOrder = Order & {
  prescription?: Prescription;
};

type PatientSubscription = Pick<
  Database['public']['Tables']['patient_subscription']['Row'],
  'price'
> & {
  subscription: Pick<
    Database['public']['Tables']['subscription']['Row'],
    'name'
  >;
};

const plus10days = (date: string) => {
  const current = new Date(date);
  return new Date(current.setDate(current.getDate() + 10));
};

const isOrderShipped = (order: PatientOrder) => {
  if (['Hallandale', 'Red Rock'].includes(order.prescription?.pharmacy || '')) {
    return isAfter(Date.now(), plus10days(order.created_at!));
  }

  return !!order.tracking_number;
};

export const handleDeniedPA = async (priorAuth: PriorAuth) => {
  // create action item
  if (!priorAuth.patient_id) {
    throw new Error(
      `Prior auth ${priorAuth.id} does not have patient associated with it`
    );
  }

  const [subs, prescriptionRequests, orders] = await Promise.all([
    supabaseAdmin
      .from('patient_subscription')
      .select('price, subscription(name)')
      .eq('patient_id', priorAuth.patient_id)
      .eq('visible', true)
      .in('status', ['active', 'trialing'])
      .ilike('subscription.name', '%weight loss%')
      .then(({ data }) => (data || []) as PatientSubscription[]),
    supabaseAdmin
      .from('prescription_request')
      .select('*')
      .eq('patient_id', priorAuth.patient_id)
      .in('status', ['REQUESTED', 'PRE_INTAKES'])
      .then(({ data }) => data || []),
    supabaseAdmin
      .from('order')
      .select('created_at, tracking_number, prescription!inner(pharmacy)')
      .eq('patient_id', priorAuth.patient_id)
      .or('medication.ilike.%semaglutide%,medication.ilike.%tirzepatide%', {
        foreignTable: 'prescription',
      })
      .then(({ data }) => (data || []) as PatientOrder[]),
  ]);

  //if not a weight loss subscriber return
  if (subs.length === 0) {
    return;
  }

  //if coaching plan return
  if (!!subs.every(s => s.subscription.name.includes('Coaching Only Plan'))) {
    return;
  }

  //check if they have any pending compound requests
  if (prescriptionRequests.some(p => p.medication_quantity_id === 98)) {
    return;
  }

  //check if they have compound order in transit
  if (!orders.length || orders.some(isOrderShipped)) {
    console.log({
      level: 'info',
      message: `Creating a task COMPOUND_MEDICATION_REQUEST for ${priorAuth.patient_id}`,
      zealthy_patient_id: priorAuth.patient_id,
    });

    const actionItem = await supabaseAdmin
      .from('patient_action_item')
      .select('id')
      .eq('patient_id', priorAuth.patient_id)
      .eq('type', 'COMPOUND_MEDICATION_REQUEST')
      .eq('canceled', false)
      .eq('completed', false)
      .maybeSingle()
      .then(({ data }) => data);

    return supabaseAdmin.from('patient_action_item').upsert({
      id: actionItem?.id,
      patient_id: priorAuth.patient_id,
      type: 'COMPOUND_MEDICATION_REQUEST',
      title: 'Order compound semaglutide or tirzepatide',
      body: 'If your insurance is unable to cover your medication, you can request medication from a partner compound pharmacy.',
      path: '/patient-portal/weight-loss-treatment/compound',
    });
  }

  return;
};
