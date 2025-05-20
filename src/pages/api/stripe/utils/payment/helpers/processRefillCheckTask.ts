import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Stripe } from 'stripe';

type PatientSubscription = {
  patient_id: string;
  id: string;
  price: number;
};
export const processRefillCheckTask = async (invoice: Stripe.Invoice) => {
  try {
    if (!invoice.subscription) {
      throw new Error(`Missing invoice subscription for invoice ${invoice.id}`);
    }
    const subscription = await supabaseAdmin
      .from('patient_subscription')
      .select('patient_id, price')
      .eq('reference_id', invoice.subscription)
      .throwOnError()
      .maybeSingle()
      .then(({ data }) => data as PatientSubscription | null);

    if (!subscription || !subscription?.patient_id) {
      throw new Error(
        `Could not find subscription for reference: ${invoice.subscription}`
      );
    }

    if (![449, 297].includes(subscription.price || 0)) {
      return;
    }

    const actionItem = await supabaseAdmin
      .from('patient_action_item')
      .select('id')
      .eq('patient_id', subscription.patient_id)
      .eq('completed', false)
      .eq('canceled', false)
      .eq('type', 'PRESCRIPTION_RENEWAL_REQUEST')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => data);

    if (actionItem) {
      console.log({
        message: `Creating a task for coordinators REFILL_CHECK_IN for a patient ${subscription.patient_id}`,
      });

      //create a task for coordinators
      await supabaseAdmin.from('task_queue').insert({
        task_type: 'REFILL_CHECK_IN',
        note: 'Bundled Weight Loss patient has not completed their refill request. Complete the task by sending them the complete refill macro for bundled patients.',
        patient_id: Number(subscription.patient_id),
        queue_type: 'Coordinator',
      });
    }
  } catch (err) {
    throw err;
  }
};
