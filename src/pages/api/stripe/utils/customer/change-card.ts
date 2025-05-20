import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import getStripeInstance from '../../createClient';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function changeCard(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  try {
    const supabase = createServerSupabaseClient<Database>({ req, res });

    const { customerId, patient_id, cardDetails } = req.body;

    // update patient default credit
    const params = {
      card: {
        number: cardDetails.number,
        exp_month: cardDetails.expiration.split('/')[0],
        exp_year: cardDetails.expiration.split('/')[1],
        cvc: cardDetails.cvc,
      },
    };

    const response = await stripe.tokens.create(params);

    await stripe.customers.update(customerId, {
      source: response?.id,
    });

    const updatePaymentProfile = await supabase
      .from('payment_profile')
      .update({ last4: response?.card?.last4 })
      .match({ customer_id: customerId, patient_id });

    if (updatePaymentProfile.status === 204) {
      res.status(200).json('Successfully updated payment');
    } else {
      res.status(500).json('There was an error updating default credit card.');
    }
  } catch (err: any) {
    return res
      .status(404)
      .json(err?.message || 'There was an unexpected error');
  }
}
