import { Database } from '@/lib/database.types';
import { UpgradeSubscriptionsRequest } from '@/types/api/create-subscriptions';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';
import getStripeInstance from '../../stripe/createClient';
import { monthsFromNow } from '@/utils/date-fns';
import Stripe from 'stripe';
import { statusMap } from '../../utils/stripeStatusMap';
import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';

const createSubscription = async (
  subscription: Stripe.Response<Stripe.Subscription>,
  supabase: SupabaseClient<Database>
) => {
  const { zealthy_patient_id, zealthy_subscription_id } = subscription.metadata;
  const priceObject = subscription.items.data[0].price;

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
      ...(subscription.metadata?.zealthy_order_id && {
        is_medication_charge: true,
      }),
      price: priceObject.unit_amount ? priceObject.unit_amount / 100 : null,
      interval: priceObject.recurring?.interval,
      interval_count: priceObject.recurring?.interval_count,
    };

  const { error: subscriptionError } = await supabase
    .from('patient_subscription')
    .insert(patientSubscription);

  if (subscriptionError) {
    throw new Error(
      `Error creating "patient_subscription" for patient: ${zealthy_patient_id}. Error: ${
        (subscriptionError as PostgrestError).message
      }`
    );
  }
};

type Subscription = Database['public']['Tables']['subscription']['Row'];
type PatientSubscription =
  Database['public']['Tables']['patient_subscription']['Row'] & {
    subscription: Subscription;
  };

// SetupIntent is used to collect payment information for the future use
export default async function upgradeSubscriptionHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  const { patient_id, subscription } = req.body as UpgradeSubscriptionsRequest;
  console.log(req.body, 'upgrade-subscription');

  try {
    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    const patientSubscriptions = await supabase
      .from('patient_subscription')
      .select('*, subscription(*)')
      .eq('patient_id', patient_id)
      .eq('status', 'active')
      .then(({ data }) => (data || []) as PatientSubscription[])
      .then(subs => subs.map(sub => sub.subscription.reference_id));

    const newSubscriptions = patientSubscriptions.filter(
      s => s === subscription.price_id
    );

    if (newSubscriptions.length) {
      res.status(200).json({
        message: `Patient ${patient_id} already subscribed to ${newSubscriptions
          .map(s => s)
          .join(', ')}`,
      });
      return;
    }

    const customer_id = await supabase
      .from('payment_profile')
      .select('customer_id')
      .eq('patient_id', patient_id)
      .single()
      .then(({ data }) => data && data.customer_id);

    const upgradingSubscription = await stripe.prices.retrieve(
      subscription.price_id
    );

    let monthsToAdd = upgradingSubscription?.recurring?.interval_count || 1;

    if (upgradingSubscription?.recurring?.interval === 'year') {
      monthsToAdd = monthsToAdd * 12;
    }

    const promises = [
      (async () => {
        let oldSubscriptionMetadata = {};

        try {
          const { data: currentSubscriptions } = await supabase
            .from('patient_subscription')
            .select('reference_id, subscription_id, current_period_end')
            .eq('patient_id', patient_id)
            .eq('status', 'active')
            .in('subscription_id', [4, 13, 14, 18, 19, 26, 34, 35, 52, 53, 54])
            .order('created_at', { ascending: false })
            .limit(1);

          if (currentSubscriptions && currentSubscriptions.length > 0) {
            const oldSub = currentSubscriptions[0];
            console.info(
              `Found old subscription to replace: ${oldSub.reference_id}`
            );

            oldSubscriptionMetadata = {
              upgrade_from_stripe_id: oldSub.reference_id,
              upgrade_from_sub_id: oldSub.subscription_id.toString(),
              upgrade_from_end_date: oldSub.current_period_end,
            };

            console.info(
              `Will store metadata about old subscription: ${JSON.stringify(
                oldSubscriptionMetadata
              )}`
            );
          }
        } catch (error) {
          console.error('Error retrieving old subscription info:', error);
        }

        const newSubscription = await stripe.subscriptions.create({
          customer: customer_id!,
          items: [{ price: subscription.price_id }],
          trial_end: monthsFromNow(monthsToAdd),
          metadata: {
            zealthy_subscription_id: subscription?.id,
            resource: 'subscription',
            zealthy_patient_id: patient_id,
            is_upgrade: 'true',
            ...oldSubscriptionMetadata,
          },
        });
        const existingPrescription = await supabase
          .from('prescription')
          .select('*')
          .eq('subscription_id', subscription.id)
          .maybeSingle();
        if (existingPrescription.data?.subscription_id) {
          await supabase
            .from('prescription')
            .update({ subscription_id: newSubscription?.id })
            .eq('id', existingPrescription.data.id);
        }
        return newSubscription;
      })(),
    ];

    await Promise.all(promises).then(async res => {
      res.map(sub => createSubscription(sub, supabase));
    });
    res.status(200).json({
      message: `Successfully create subscription(s) for patient: ${patient_id}`,
    });
  } catch (err) {
    console.error('upgrade-subscription-err', err);
    res.status(422).json({
      message: `Was not able to create subscriptions for ${patient_id}`,
    });
  }
}
