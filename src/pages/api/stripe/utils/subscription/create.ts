import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { pushSubscriptionsToCustomerIo } from '@/pages/api/utils/push-subscriptions-to-customerio';
import { statusMap } from '@/pages/api/utils/stripeStatusMap';
import { PostgrestError } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { getErrorMessage } from '@/utils/getErrorMessage';

type Subscription = Database['public']['Tables']['subscription']['Row'];
type PatientSubscription =
  Database['public']['Tables']['patient_subscription']['Row'] & {
    subscription: Subscription;
  };

export const manageSubscriptionCreate = async (
  subscription: Stripe.Subscription
) => {
  const {
    zealthy_patient_id,
    zealthy_subscription_id,
    zealthy_care,
    zealthy_product_name,
  } = subscription.metadata;
  const priceObject = subscription.items.data[0].price;

  try {
    // check if patient already subscribed to current price
    const patientSubscriptions = await supabaseAdmin
      .from('patient_subscription')
      .select('*, subscription(*)')
      .eq('patient_id', Number(zealthy_patient_id))
      .eq('status', 'active')
      .then(({ data }) => (data || []) as PatientSubscription[])
      .then(subs => subs.map(sub => sub.subscription.reference_id));

    if (patientSubscriptions.includes(priceObject.id)) {
      console.log({
        level: 'info',
        message: `Patient ${zealthy_patient_id} already subscribed to price: ${priceObject.id}`,
      });
      return true;
    }

    // build patient subscription
    const patientSubscription: Database['public']['Tables']['patient_subscription']['Insert'] =
      {
        patient_id: Number(zealthy_patient_id),
        subscription_id: Number(zealthy_subscription_id),
        reference_id: subscription.id,
        status: statusMap[subscription.status] || subscription.status,
        current_period_start: new Date(
          subscription.current_period_start * 1000
        ).toISOString(),
        current_period_end: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
        ...(subscription?.cancel_at && {
          cancel_at: new Date(subscription.cancel_at * 1000).toISOString(),
        }),
        ...(subscription.metadata?.zealthy_order_id && {
          order_id: parseInt(subscription.metadata.zealthy_order_id, 10),
        }),
        price: priceObject.unit_amount ? priceObject.unit_amount / 100 : null,
        interval: priceObject.recurring?.interval,
        interval_count: priceObject.recurring?.interval_count,
        product: zealthy_product_name,
      };

    // insert new subscription to DB
    if (patientSubscription?.order_id) {
      const { error: medicationSubError } = await supabaseAdmin
        .from('patient_prescription')
        .upsert({
          ...patientSubscription,
          care: zealthy_care,
        });

      if (medicationSubError) {
        throw new Error(
          `Error creating "patient_prescription" for patient: ${zealthy_patient_id}. Error: ${
            (medicationSubError as PostgrestError).message
          }`
        );
      }
    } else {
      const { error: subscriptionError } = await supabaseAdmin
        .from('patient_subscription')
        .upsert(patientSubscription);

      if (subscriptionError) {
        throw new Error(
          `Error creating "patient_subscription" for patient: ${zealthy_patient_id}. Error: ${
            (subscriptionError as PostgrestError).message
          }`
        );
      }
    }

    //push subscriptions to freshpaint
    await pushSubscriptionsToCustomerIo(Number(zealthy_patient_id));

    return true;
  } catch (err: any) {
    console.error({
      errorMessage: getErrorMessage(err, 'Something went wrong'),
      errObj: err,
    });
    throw new Error(
      `Error in subscription create: ${
        typeof err === 'string'
          ? err
          : JSON.stringify(err?.message || 'There was an unexpected error')
      }`
    );
  }
};
