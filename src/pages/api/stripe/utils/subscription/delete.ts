import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { pushSubscriptionsToCustomerIo } from '@/pages/api/utils/push-subscriptions-to-customerio';

import Stripe from 'stripe';
import { handlePrescriptionCancelation } from './_utils/handlePrescriptionCancelation';
import { handleSubscriptionCancelation } from './_utils/handleSubscriptionCancelation';
import { PatientProps } from '@/components/hooks/data';
import VWOClient from '@/lib/vwo/client';

type updateObj = {
  status: string;
  canceled_at: string;
  cancel_reason?: string;
};

export const manageSubscriptionDelete = async (
  subscription: Stripe.Subscription
) => {
  const { metadata, id, cancellation_details } = subscription;
  const vwoInstance = await VWOClient.getInstance(supabaseAdmin);

  if (!metadata.zealthy_patient_id)
    throw new Error('Missing patient id in subscription delete');

  try {
    const patient = await supabaseAdmin
      .from('patient')
      .select(`*, profiles (*)`)
      .eq('id', Number(metadata.zealthy_patient_id))
      .maybeSingle()
      .then(({ data }) => data as PatientProps);

    const updateObj: updateObj = {
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    };

    if (!!cancellation_details?.comment) {
      updateObj.cancel_reason = cancellation_details.comment;
    } //when member upgrades/downgrades their subscription, leave the reason. otherwise, stripe reason defaults to 'cancellation_requested', which we don't want to overwrite info currently in column.
    else if (
      !!cancellation_details?.reason &&
      cancellation_details.reason !== 'cancellation_requested'
    ) {
      updateObj.cancel_reason = cancellation_details.reason;
    }

    const [medicationSub, membership] = await Promise.all([
      supabaseAdmin
        .from('patient_prescription')
        .update(updateObj)
        .eq('patient_id', Number(metadata.zealthy_patient_id))
        .eq('reference_id', id)
        .select()
        .maybeSingle()
        .then(({ data }) => data),
      supabaseAdmin
        .from('patient_subscription')
        .update(updateObj)
        .eq('patient_id', Number(metadata.zealthy_patient_id))
        .eq('reference_id', id)
        .select()
        .maybeSingle()
        .then(({ data }) => data),

      handlePrescriptionCancelation(id),
      handleSubscriptionCancelation(id),
    ]);

    if (medicationSub?.status === 'canceled') {
      window.VWO?.event('medSubscriptionCancel');

      await Promise.allSettled([
        vwoInstance.track('6140', patient, 'medSubscriptionCancel'),
        vwoInstance.track('3452-2', patient, 'medSubscriptionCancel'),
        vwoInstance.track('4918', patient, 'medSubscriptionCancel'),
        vwoInstance?.track('5871_new', patient, 'medSubscriptionCancel'),
        vwoInstance.track('5751', patient, 'medSubscriptionCancel'),
        vwoInstance.track('5053', patient, 'medSubscriptionCancel'),
        vwoInstance.track('4798', patient, 'medSubscriptionCancel'),
        vwoInstance.track('5483', patient, 'medSubscriptionCancel'),
        vwoInstance.track('5483-2', patient, 'medSubscriptionCancel'),
        vwoInstance.track('8552', patient, 'medSubscriptionCancel'),
        vwoInstance.track('8552_2', patient, 'medSubscriptionCancel'),
        vwoInstance.track('8284', patient, 'medSubscriptionCancel'),
      ]);
    }

    if (
      membership?.status === 'canceled' &&
      !membership?.cancel_reason?.toLowerCase().includes('duplicate')
    ) {
      await Promise.allSettled([
        vwoInstance.track('7895', patient, 'wlMembershipCancellation'),
        vwoInstance.track('8201', patient, 'wlMembershipCancellation'),
        vwoInstance.track('6140', patient, 'wlMembershipCancellation'),
        vwoInstance.track('7895', patient, 'wlMembershipCancellation'),
        vwoInstance.track('6303', patient, 'wlMembershipCancellation'),
        vwoInstance.track('6822-2', patient, 'wlMembershipCancellation'),
        vwoInstance.track('5053', patient, 'wlMembershipCancellation'),
        vwoInstance.track('6822-3', patient, 'wlMembershipCancellation'),
        vwoInstance.track('5252', patient, 'wlMembershipCancellation'),
        vwoInstance.track('5777', patient, 'wlMembershipCancellation'),
        vwoInstance.track('5867', patient, 'wlMembershipCancellation'),
        vwoInstance.track('7458', patient, 'wlMembershipCancellation'),
        vwoInstance.track('Clone_6775', patient, 'wlMembershipCancellation'),
        vwoInstance.track('Clone_6775_2', patient, 'wlMembershipCancellation'),
        vwoInstance.track('8288', patient, 'wlMembershipCancellation'),
        vwoInstance.track('3452-2', patient, 'wlMembershipCancellation'),
        vwoInstance.track('5751', patient, 'wlMembershipCancellation'),
        vwoInstance.track('4601', patient, 'wlMembershipCancellation'),
        vwoInstance.track('4918', patient, 'wlMembershipCancellation'),
        vwoInstance.track('6825', patient, 'wlMembershipCancellation'),
        vwoInstance.track('6826', patient, 'wlMembershipCancellation'),
        vwoInstance?.track('5871_new', patient, 'wlMembershipCancellation'),
        vwoInstance?.track('75801', patient, 'wlMembershipCancellation'),
        vwoInstance?.track('7752', patient, 'wlMembershipCancellation'),
        vwoInstance?.track('7743', patient, 'wlMembershipCancellation'),
        vwoInstance?.track('4798', patient, 'wlMembershipCancellation'),
        vwoInstance.track(
          '7746-2',
          patient,
          'wlMembershipScheduleForCancellation'
        ),
        vwoInstance.track(
          '9363',
          patient,
          'wlMembershipScheduleForCancellation'
        ),
        vwoInstance?.track('780101', patient, 'wlMembershipCancellation'),
        vwoInstance?.track('780102', patient, 'wlMembershipCancellation'),
        vwoInstance?.track('7934', patient, 'wlMembershipCancellation'),
        vwoInstance?.track('5483', patient, 'wlMembershipCancellation'),
        vwoInstance?.track('7960', patient, 'wlMembershipCancellation'),
        vwoInstance?.track('7380', patient, 'wlMembershipCancellation'),
        vwoInstance?.track('7935', patient, 'wlMembershipCancellation'),
        vwoInstance?.track('8676', patient, 'wlMembershipCancellation'),
        vwoInstance?.track('8552', patient, 'wlMembershipCancellation'),
        vwoInstance?.track('8912', patient, 'wlMembershipCancellation'),
        vwoInstance?.track('9363', patient, 'wlMembershipCancellation'),
        vwoInstance?.track('8685', patient, 'wlMembershipCancellation'),
        vwoInstance?.track('9057_1', patient, 'wlMembershipCancellation'),
        vwoInstance?.track('9057_2', patient, 'wlMembershipCancellation'),
        vwoInstance?.track('9057_3', patient, 'wlMembershipCancellation'),
        vwoInstance?.track('9502', patient, 'wlMembershipCancellation'),
      ]);
    }

    //push subscriptions to freshpaint
    pushSubscriptionsToCustomerIo(Number(metadata.zealthy_patient_id));

    return true;
  } catch (err: any) {
    console.error(
      `Error deleting subscription: ${subscription.id} for patient: ${metadata.zealthy_patient_id}, Error: ${err}`
    );

    throw new Error(
      `Error deleting subscription: ${subscription.id} for patient: ${
        metadata.zealthy_patient_id
      }, Error: ${
        typeof err === 'string'
          ? err
          : JSON.stringify(err?.message || 'There was an unexpected error')
      }`
    );
  }
};
