import { Database } from '@/lib/database.types';
import { CreateSubscriptionKlarna } from '@/types/api/create-subscriptions';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';
import getStripeInstance from '../../stripe/createClient';
import Stripe from 'stripe';
import { statusMap } from '../../utils/stripeStatusMap';
import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';

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

// SetupIntent is used to collect payment information for the future use
export default async function createSubscriptionsHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  const { patient_id, subscription } = req.body as CreateSubscriptionKlarna;

  try {
    // create supabase client
    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    const customer_id = await supabase
      .from('payment_profile')
      .select('customer_id')
      .eq('patient_id', patient_id)
      .single()
      .then(({ data }) => data && data.customer_id);

    const createdSubscription = await stripe.subscriptions.create({
      customer: customer_id!,
      items: [{ price: subscription.planId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        payment_method_types: ['klarna'] as any,
        save_default_payment_method: 'on_subscription',
      },
      metadata: {
        zealthy_subscription_id: subscription.id,
        resource: 'subscription',
        zealthy_patient_id: patient_id,
      },
      expand: ['latest_invoice.payment_intent'],
    });

    createSubscription(createdSubscription, supabase);

    const latestInvoice = createdSubscription.latest_invoice as Stripe.Invoice;

    const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;

    const client_secret = paymentIntent.client_secret;

    res.status(200).json({
      message: `Successfully created Klarna subscription for patient: ${patient_id}`,
      client_secret,
      subscriptionId: createdSubscription.id,
    });
  } catch (err) {
    console.error('create-sub-err', err);
    res.status(422).json({
      message: `Was not able to create klarna subscription for ${patient_id}`,
    });
  }
}
