import { PatientReferralRedeemProps } from '@/components/hooks/data';
import { Database } from '@/lib/database.types';
import { CreateSubscriptionsRequest } from '@/types/api/create-subscriptions';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';
import getStripeInstance from '../../stripe/createClient';
import { monthsFromNow } from '@/utils/date-fns';
import Stripe from 'stripe';
import { statusMap } from '../../utils/stripeStatusMap';
import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { referralConvertedEvent } from '@/utils/freshpaint/events';

const createSubscription = async (
  subscription: Stripe.Response<Stripe.Subscription>,
  supabase: SupabaseClient<Database>
) => {
  const { zealthy_patient_id, zealthy_subscription_id } = subscription.metadata;
  const priceObject = subscription.items.data[0].price;

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
    };

  const { error: subscriptionError } = await supabase
    .from('patient_subscription')
    .insert(patientSubscription);

  if (subscriptionError) {
    console.log({ subscriptionError });
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
export default async function createSubscriptionsHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  const { patient_id, subscriptions } = req.body as CreateSubscriptionsRequest;

  try {
    // create supabase client
    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    // check patient subscriptions
    const patientSubscriptions = await supabase
      .from('patient_subscription')
      .select('*, subscription(*)')
      .eq('patient_id', patient_id)
      .eq('status', 'active')
      .then(({ data }) => (data || []) as PatientSubscription[])
      .then(subs => subs.map(sub => sub.subscription.reference_id));

    const newSubscriptions = subscriptions.filter(
      s => !patientSubscriptions.includes(s.planId)
    );

    if (newSubscriptions.length === 0) {
      res.status(200).json({
        message: `Patient ${patient_id} already subscribed to ${subscriptions
          .map(s => s.planId)
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

    const promises = newSubscriptions.map(s =>
      stripe.subscriptions.create({
        customer: customer_id!,
        items: [{ price: s.planId }],
        trial_end: monthsFromNow(s.recurring.interval_count),
        metadata: {
          zealthy_subscription_id: s.id,
          resource: 'subscription',
          zealthy_patient_id: patient_id,
        },
      })
    );

    await Promise.all(promises).then(async res => {
      //create subscriptions
      res.map(sub => createSubscription(sub, supabase));
      if (res.find(sub => sub.metadata.zealthy_subscription_id === '4')) {
        const profile_id = await supabase
          .from('patient')
          .select('profile_id')
          .eq('id', patient_id)
          .single()
          .then(({ data }) => data && data.profile_id);
        if (profile_id) {
          const redeemed = await supabase
            .from('patient_referral_redeem')
            .select('*, patient_referral(*)')
            .eq('profile_id', profile_id)
            .eq('redeemed', false)
            .single()
            .then(({ data }) => data as PatientReferralRedeemProps);

          if (
            redeemed?.id &&
            redeemed?.patient_referral_code &&
            redeemed?.patient_referral?.patient_id
          ) {
            await stripe.subscriptions.update(
              res.find(sub => sub.metadata.zealthy_subscription_id === '4')
                ?.id || '',
              {
                coupon: process.env.TEN_DOLLARS_OFF,
              }
            );
            await supabase
              .from('patient_referral_redeem')
              .update({ redeemed: true })
              .eq('id', redeemed?.id);

            const patient: any = await supabase
              .from('patient')
              .select('*, profile: profiles(*)')
              .eq('profile_id', profile_id)
              .single()
              .then(({ data }) => data);

            const referrer = await supabase
              .from('patient_referral')
              .select('patient_id')
              .eq('code', redeemed?.patient_referral_code)
              .single();

            await referralConvertedEvent(
              patient?.profile?.id,
              patient?.profile?.email,
              referrer?.data?.patient_id as number,
              patient?.profile?.first_name,
              patient?.profile?.last_name,
              patient?.region
            );

            const referrerSub = await supabase
              .from('payment_profile')
              .select('customer_id')
              .eq('patient_id', redeemed?.patient_referral?.patient_id)
              .single()
              .then(({ data }) => data);

            await stripe.customers.createBalanceTransaction(
              referrerSub?.customer_id || '',
              {
                amount: -10 * 100,
                currency: 'usd',
              }
            );
          }
        }
      }
    });
    res.status(200).json({
      message: `Successfully create subscription(s) for patient: ${patient_id}`,
    });
  } catch (err) {
    console.error('create-sub-err', err);
    res.status(422).json({
      message: `Was not able to create subscriptions for ${patient_id}`,
    });
  }
}
