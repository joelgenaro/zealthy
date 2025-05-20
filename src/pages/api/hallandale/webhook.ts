import type { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabase';
import { getErrorMessage } from '@/utils/getErrorMessage';

interface HallandaleRequestBody {
  pharmacyLocation: string;
  fillId: string;
  rxNumber: string;
  foreignRxNumber: null;
  orderId: string; //hallandale order id
  referenceId: null;
  practiceId: string;
  providerId: string;
  patientId: string;
  lfdrugId: string;
  rxStatus: string; // e.g. 'SHIPPED'
  rxStatusDateTime: string; // e.g '2024-04-11T06:59:28',
  deliveryService: string; // e.g. 'FEDEX-STANDARD OVERNIGHT',
  service: string; //
  trackingNumber: string; // e.g. '273282341889',
  shipAddressLine1: string;
  shipAddressLine2: string | null;
  shipAddressLine3: string | null;
  shipCity: string;
  shipState: string; //e.g. 'FL',
  shipZip: string;
  shipCountry: string; //e.g. 'US',
  shipCarrier: string; // 'FEDEX',
  foreignOrderId: null;
  patientEmail: string;
}

export default async function HallandaleWebhookHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const supabase = getServiceSupabase();
    console.log(req.body, '-------REQ BODY------');

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
    const expectedUsername = process.env.HALLANDALE_WEBHOOK_USER;
    const expectedPassword = process.env.HALLANDALE_WEBHOOK_PASSWORD;

    if (username !== expectedUsername || password !== expectedPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // currently unsure of data structure we're ingesting
    const body: HallandaleRequestBody = Array.isArray(req.body)
      ? req.body[0]
      : req.body;

    if (!body.orderId) {
      return res.status(405).json({ message: 'Order id must be included' });
    }
    const order = await supabase
      .from('order')
      .select(`*, prescription_id(*)`)
      .eq('hallandale_order_id', body.orderId)
      .throwOnError()
      .limit(1)
      .single();

    const orderParams = {
      tracking_number: body?.trackingNumber || order?.data?.tracking_number,
      tracking_URL: body?.trackingNumber
        ? `https://www.fedex.com/fedextrack/?trknbr=${body.trackingNumber}`
        : order?.data?.tracking_URL,
      order_status: body?.rxStatus || order?.data?.order_status,
    };

    console.log({ order, orderParams });

    if (
      !order?.data?.group_id &&
      order?.data?.prescription_id?.medication_quantity_id === 98
    ) {
      throw new Error('Unable to identify order in system');
    }

    const updatedOrder =
      order?.data?.prescription_id?.medication_quantity_id === 98
        ? await supabase
            .from('order')
            .update(orderParams)
            .throwOnError()
            .eq('group_id', order?.data?.group_id)
        : await supabase
            .from('order')
            .update(orderParams)
            .throwOnError()
            .eq('id', order?.data?.id);

    if (updatedOrder.status !== 204) {
      throw new Error('Unable to process data');
    }

    return res.status(204).end();
  } catch (e) {
    const errorMessage = getErrorMessage(e);
    console.log('hallandale_webhook_err', errorMessage);
    return res.status(500).json({ error: (e as Error).message });
  }
}
