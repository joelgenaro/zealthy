import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Subscription = Database['public']['Tables']['subscription']['Row'];

type PatientSubscription =
  Database['public']['Tables']['patient_subscription']['Row'] & {
    subscription: Subscription;
  };

type Prescription = Database['public']['Tables']['prescription']['Row'];

type Order = Database['public']['Tables']['order']['Row'] & {
  prescription: Prescription;
};

type PatientPrescription =
  Database['public']['Tables']['patient_prescription']['Row'] & {
    order: Order;
  };

export type SubscriptionResult = {
  name: string | null;
  status: string | null;
};

export const fetchVisibleSubscriptions = async (patientId: number) => {
  try {
    const subscriptions = await Promise.all([
      //fetch visible patient subscriptions
      supabaseAdmin
        .from('patient_subscription')
        .select('*, subscription(*)')
        .eq('patient_id', patientId)
        .not('subscription_id', 'eq', 5)
        .eq('visible', true)
        .then(({ data }) => (data || []) as PatientSubscription[])
        .then(
          subs =>
            subs.map(sub => ({
              name: sub.subscription.name,
              status: sub.status,
            })) as SubscriptionResult[]
        ),
      //fetch visible patient medications
      supabaseAdmin
        .from('patient_prescription')
        .select('*, order(*, prescription(*))')
        .eq('patient_id', patientId)
        .eq('visible', true)
        .then(({ data }) => (data || []) as PatientPrescription[])
        .then(subs =>
          subs.map(sub => ({
            name: sub.order.prescription.medication,
            status: sub.status,
          }))
        )
        .then(data => data as SubscriptionResult[]),
    ]).then(subscriptions => subscriptions.flat());

    console.info(
      `Patient: ${patientId} has subscriptions: ${subscriptions
        .map(s => `${s.name}: ${s.status}`)
        .join(', ')}`
    );

    return subscriptions;
  } catch (err) {
    console.error(err);
    return [];
  }
};
