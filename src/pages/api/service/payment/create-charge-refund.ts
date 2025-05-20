import { Database } from '@/lib/database.types';
import { CreateChargeRefundRequest } from '@/types/api/create-charge-refund';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';
import getStripeInstance from '../../stripe/createClient';

export default async function fetchPaymentMethodsHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  if (req.method !== 'POST') return;

  const { chargeId, refundAmount } = req.body as CreateChargeRefundRequest;

  if (!chargeId || !refundAmount) {
    return res.status(422).json({
      message: 'chargeId and refundAmount are required',
    });
  }

  try {
    // create supabase client
    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    const refund = await stripe.refunds.create({
      charge: chargeId,
      amount: refundAmount * 100,
    });

    if (refund?.status === 'succeeded') {
      res.status(200).json({
        message: `Refund of ${refundAmount} for ${chargeId} was successful`,
      });
    }
  } catch (err) {
    console.error('create-charge-refund-err', err);
    res.status(422).json({
      message: 'There was an error processing the refund for ' + chargeId,
    });
  }
}
