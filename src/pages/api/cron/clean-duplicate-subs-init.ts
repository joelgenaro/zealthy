import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextApiRequest, NextApiResponse } from 'next';
import getStripeInstance from '../stripe/createClient';
const stripe = getStripeInstance();
const BATCH_SIZE = 1;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const signature = req.headers['supabase-signature'];
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;
  // console.log('Received request with signature:', signature);
  if (!signature || !secret || signature !== secret) {
    console.log('Unauthorized request');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const entry = await supabaseAdmin
    .from('subscription_cleaning_history')
    .insert({
      date: new Date().toDateString(),
      total_cleaned: 0,
    })
    .select('*')
    .single();
  console.log('new entry: ', entry);
  res.status(200).send('OK');
}
