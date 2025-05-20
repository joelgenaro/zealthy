import type { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabase';

export default async function BelmarWebhookHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const supabase = getServiceSupabase();

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Missing credentials' });
    }

    const credentials = Buffer.from(
      authHeader.slice('Basic '.length),
      'base64'
    ).toString('utf-8');

    const [username, password] = credentials.split(':');
    const expectedUsername = process.env.BELMAR_WEBHOOK_USER;
    const expectedPassword = process.env.BELMAR_WEBHOOK_PASSWORD;

    if (username !== expectedUsername || password !== expectedPassword) {
      console.info('invalid belmar webhook credentials');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // currently unsure of data structure we're ingesting
    const body = Array.isArray(req.body) ? req.body[0] : req.body;

    if (!Number(body.referenceId)) {
      return res.status(400).end();
    }

    const order = await supabase
      .from('order')
      .select(`order_status, tracking_number, tracking_URL`)
      .eq('id', Number(body.referenceId))
      .single();

    const orderParams = {
      tracking_number: body.trackingNumber || order?.data?.tracking_number,
      tracking_URL: body.trackingNumber
        ? `https://www.ups.com/track?track=yes&trackNums=${body.trackingNumber}`
        : order?.data?.tracking_URL,
      order_status: body.rxStatus || order?.data?.order_status,
    };

    const updatedOrder = await supabase
      .from('order')
      .update(orderParams)
      .eq('id', Number(body.referenceId));

    if (updatedOrder.status !== 204) {
      throw new Error('Unable to process data');
    }

    return res.status(204).end();
  } catch (e) {
    const errorMessage = (e as Error)?.message;
    console.warn(errorMessage);
    return res.status(500).json({ error: errorMessage });
  }
}
