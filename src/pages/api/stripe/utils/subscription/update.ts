import {
  PatientPrescriptionProps,
  PatientProps,
} from '@/components/hooks/data';
import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { pushSubscriptionsToCustomerIo } from '@/pages/api/utils/push-subscriptions-to-customerio';
import { statusMap } from '@/pages/api/utils/stripeStatusMap';
import {
  weightLossScheduledForCancelationEvent,
  personalizePsychiatryScheduledForCancelationEvent,
  mhCoachingScheduledForCancelationEvent,
  medicationScheduledForCancelationEvent,
  weightLossScheduledForCancelationDiscountEvent,
} from '@/utils/freshpaint/events';
import Stripe from 'stripe';

export const manageSubscriptionUpdate = async (
  subscription: Stripe.Subscription
) => {
  const { zealthy_patient_id, zealthy_order_id } = subscription.metadata;

  try {
    // build patient subscription
    const priceObject = subscription.items.data[0].price;

    const patientSubscription: Database['public']['Tables']['patient_subscription']['Update'] =
      {
        current_period_start: new Date(
          subscription.current_period_start * 1000
        ).toISOString(),
        current_period_end: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
        status: subscription.cancel_at_period_end
          ? 'scheduled_for_cancelation'
          : subscription.status === 'trialing' && subscription.metadata?.paused
          ? 'paused'
          : statusMap[subscription.status],
        ...(subscription.cancel_at && {
          cancel_at: new Date(subscription.cancel_at * 1000).toISOString(),
        }),
        ...(priceObject.unit_amount && {
          price: priceObject.unit_amount / 100,
        }),
        ...(subscription.cancel_at_period_end && {
          scheduled_for_cancelation_at: new Date().toISOString(),
        }),
        interval_count: priceObject.recurring?.interval_count,
        interval: priceObject.recurring?.interval,
        order_id: parseInt(zealthy_order_id, 10),
      };

    await Promise.allSettled([
      supabaseAdmin
        .from('patient_prescription')
        .update(patientSubscription)
        .eq('patient_id', zealthy_patient_id)
        .eq('reference_id', subscription.id),
      supabaseAdmin
        .from('patient_subscription')
        .update(patientSubscription)
        .eq('patient_id', zealthy_patient_id)
        .eq('reference_id', subscription.id),
    ]);

    // If canceling regular, non-bundled weight loss
    if (
      subscription.cancel_at_period_end &&
      parseInt(subscription.metadata.zealthy_subscription_id, 10) === 4 &&
      patientSubscription.price === 135
    ) {
      const patientInfo = await supabaseAdmin
        .from('patient')
        .select(`reactivation_coupon_sent_at, profiles(id, email)`)
        .eq('id', zealthy_patient_id)
        .single()
        .then(({ data }) => data as PatientProps);

      weightLossScheduledForCancelationEvent(
        patientInfo?.profiles?.id,
        patientInfo?.profiles?.email
      );

      if (!patientInfo.reactivation_coupon_sent_at) {
        const nowDate = new Date().toISOString(); // Use ISO format for consistency

        // Perform the update only if reactivation_coupon_sent_at is null
        const { data, error } = await supabaseAdmin
          .from('patient')
          .update({ reactivation_coupon_sent_at: nowDate })
          .eq('id', patientInfo.id)
          .is('reactivation_coupon_sent_at', null); // Ensure it only updates if it's still null

        // Check if update was successful and the row was modified
        if (!error && data) {
          weightLossScheduledForCancelationDiscountEvent(
            patientInfo?.profiles?.id,
            patientInfo?.profiles?.email
          );
        }
      }
      const addToQueue = await supabaseAdmin
        .from('task_queue')
        .insert({
          task_type: 'SCHEDULED_CANCELATION',
          patient_id: parseInt(zealthy_patient_id, 10),
          queue_type: 'Patient Experience',
        })
        .select()
        .single()
        .throwOnError()
        .then(({ data }) => data);
      await supabaseAdmin
        .from('patient_subscription')
        .update({ queue_id: addToQueue?.id })
        .throwOnError()
        .eq('reference_id', subscription.id);
    }

    // Check if subscription is scheduled_for_cancelation and if weight loss
    if (
      subscription.cancel_at_period_end &&
      [4, 13, 14, 18, 19].includes(
        parseInt(subscription.metadata.zealthy_subscription_id, 10)
      ) &&
      patientSubscription.price !== 135
    ) {
      const patientEmail = await supabaseAdmin
        .from('patient')
        .select(`profiles(email)`)
        .eq('id', zealthy_patient_id)
        .single()
        .then(({ data }) => data as PatientProps);

      weightLossScheduledForCancelationEvent(
        patientEmail?.profiles?.id,
        patientEmail?.profiles?.email
      );

      const addToQueue = await supabaseAdmin
        .from('task_queue')
        .insert({
          task_type: 'SCHEDULED_CANCELATION',
          patient_id: parseInt(zealthy_patient_id, 10),
          queue_type: 'Patient Experience',
        })
        .select()
        .single()
        .throwOnError()
        .then(({ data }) => data);
      await supabaseAdmin
        .from('patient_subscription')
        .update({ queue_id: addToQueue?.id })
        .throwOnError()
        .eq('reference_id', subscription.id);
    }

    // Check if subscription is scheduled_for_cancelation and if psychiatry
    if (
      subscription.cancel_at_period_end &&
      [7].includes(parseInt(subscription.metadata.zealthy_subscription_id, 10))
    ) {
      const { email, id } = await supabaseAdmin
        .from('patient')
        .select('profiles(id, email)')
        .eq('id', zealthy_patient_id)
        .limit(1)
        .maybeSingle()
        .then(({ data }) => ({
          email: (data as PatientProps)?.profiles?.email,
          id: (data as PatientProps)?.profiles?.id,
        }));

      personalizePsychiatryScheduledForCancelationEvent(id, email);

      const addToQueue = await supabaseAdmin
        .from('task_queue')
        .insert({
          task_type: 'SCHEDULED_CANCELATION',
          patient_id: parseInt(zealthy_patient_id, 10),
          queue_type: 'Patient Experience',
        })
        .select()
        .single()
        .throwOnError()
        .then(({ data }) => data);
      await supabaseAdmin
        .from('patient_subscription')
        .update({ queue_id: addToQueue?.id })
        .eq('reference_id', subscription.id)
        .throwOnError();
    }

    // Check if subscription is scheduled_for_cancelation and if mh coaching
    if (
      subscription.cancel_at_period_end &&
      [3].includes(parseInt(subscription.metadata.zealthy_subscription_id, 10))
    ) {
      const patientEmail = await supabaseAdmin
        .from('patient')
        .select(`profiles(email)`)
        .eq('id', zealthy_patient_id)
        .single()
        .throwOnError()
        .then(({ data }) => data as PatientProps);

      mhCoachingScheduledForCancelationEvent(
        patientEmail?.profiles?.id,
        patientEmail?.profiles?.email
      );

      const addToQueue = await supabaseAdmin
        .from('task_queue')
        .insert({
          task_type: 'SCHEDULED_CANCELATION',
          patient_id: parseInt(zealthy_patient_id, 10),
          queue_type: 'Patient Experience',
        })
        .select()
        .single()
        .throwOnError()
        .then(({ data }) => data);
      await supabaseAdmin
        .from('patient_subscription')
        .update({ queue_id: addToQueue?.id })
        .eq('reference_id', subscription.id)
        .throwOnError();
    }

    // Check if subscription is scheduled_for_cancelation and if a prescription
    if (
      subscription.cancel_at_period_end &&
      [5].includes(parseInt(subscription.metadata.zealthy_subscription_id, 10))
    ) {
      const { email, id } = await supabaseAdmin
        .from('patient')
        .select('profiles(id, email)')
        .eq('id', zealthy_patient_id)
        .limit(1)
        .maybeSingle()
        .then(({ data }) => ({
          email: (data as PatientProps)?.profiles?.email,
          id: (data as PatientProps)?.profiles?.id,
        }));

      const order = await supabaseAdmin
        .from('patient_prescription')
        .select(
          '*, subscription(*), order!inner(*, prescription!inner(*, medication_quantity!inner(*, medication_dosage!inner(*, medication!inner(*)))))'
        )
        .eq('reference_id', subscription.id)
        .maybeSingle()
        .throwOnError()
        .then(({ data }) => data as PatientPrescriptionProps);
      medicationScheduledForCancelationEvent(
        id,
        email,
        order?.order?.prescription?.medication_quantity?.medication_dosage
          ?.medication?.display_name!
      );
    }

    //push subscriptions to freshpaint
    pushSubscriptionsToCustomerIo(Number(zealthy_patient_id));

    return true;
  } catch (err: any) {
    console.error(
      (err as Error).message ||
        `Error updating med subscription: ${subscription.id} for patient: ${zealthy_patient_id}`,
      { error: err }
    );
    throw new Error(
      `Error in subscription update: ${
        typeof err === 'string'
          ? err
          : JSON.stringify(err?.message || 'There was an unexpected error')
      }`
    );
  }
};
