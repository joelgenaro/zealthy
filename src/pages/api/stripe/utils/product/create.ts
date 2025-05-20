import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Stripe from 'stripe';
import getStripeInstance from '../../createClient';

type Product = Database['public']['Tables']['subscription']['Insert'];

export const upsertProductRecord = async (price: Stripe.Price) => {
  const stripe = getStripeInstance();

  try {
    // get product related information
    const stripeProduct = await stripe.products.retrieve(
      price.product as string
    );

    // new product
    const productData: Product = {
      currency: price.currency.toUpperCase(),
      name: stripeProduct.name,
      price: price.unit_amount! / 100,
      processor: 'Stripe',
      reference_id: price.id,
      active: price.active,
    };

    //check if product exist
    const { data } = await supabaseAdmin
      .from('subscription')
      .select('id, reference_id, processor')
      .eq('reference_id', price.id)
      .single()
      .throwOnError();

    if (data && data.id) {
      productData.id = data.id;
    }

    // upsert new product
    const { data: subscriptionData } = await supabaseAdmin
      .from('subscription')
      .upsert(productData)
      .select('*')
      .single()
      .throwOnError();
    console.info(JSON.stringify({ subscriptionData }));
  } catch (err: any) {
    console.error({ err });
    throw new Error(
      `Error in upsertProductRecord: ${JSON.stringify(
        err?.message || 'There was an unexpected error'
      )}`
    );
  }
};
