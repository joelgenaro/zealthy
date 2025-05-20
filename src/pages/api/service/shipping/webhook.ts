import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextApiRequest, NextApiResponse } from 'next';
import { Tracker, Event } from '@easypost/api';
import { Readable } from 'stream';
import client from '@/lib/easypost/client';
import { format } from 'date-fns';
import { deliveredEvent } from '@/utils/lab-orders/deliveredMessage';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

const webhookHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    console.error(`Invalid request method: ${req.method}`);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const buf = await buffer(req);
  const webhookSecret = process.env.EASYPOST_WEBHOOK_SECRET;

  try {
    if (!webhookSecret) {
      console.error('EASYPOST_WEBHOOK_SECRET is not configured.');
      return res.status(500).json({ message: 'Webhook secret not configured' });
    }

    const event = client.Utils.validateWebhook(
      buf,
      req.headers,
      webhookSecret
    ) as Event;

    console.log(
      `Processing EasyPost Webhook: ${event.description}: ${event.id}`
    );

    if (!['tracker.created', 'tracker.updated'].includes(event.description)) {
      console.log(`Ignored event: ${event.description}`);
      return res
        .status(200)
        .json({ message: `Ignored event: ${event.description}` });
    }

    const tracker = event.result as Tracker;

    if (!tracker?.tracking_code || !tracker?.status) {
      console.error(`Invalid tracker data received:`, tracker);
      return res.status(400).json({ message: 'Invalid tracker data' });
    }

    const { data: orders } = await supabaseAdmin
      .from('order')
      .select('*')
      .eq('tracking_number', tracker.tracking_code);

    const { data: labOrders } = await supabaseAdmin
      .from('lab_order')
      .select('*')
      .eq('tracking_number', tracker.tracking_code);

    if (!orders || orders.length === 0) {
      console.log(
        `No orders found for tracking number: ${tracker.tracking_code}`
      );
      return res.status(200).json({
        message: `No orders found for tracking number: ${tracker.tracking_code}`,
      });
    }

    const easyPostOrderStatus = tracker.status.includes(' - ')
      ? tracker.status.split(' - ')[1]
      : tracker.status;
    let updateOrderStatus = easyPostOrderStatus.toUpperCase().replace(' ', '_');

    const alternativeOrderStatus = tracker.status.toUpperCase();

    // Overwrite UNKNOWN with Processing
    if (updateOrderStatus === 'UNKNOWN') {
      console.log(
        'Received UNKNOWN status from EasyPost, changing to Processing.'
      );
      updateOrderStatus = 'Processing';
    }

    const currentOrderStatus = orders[0].order_status;
    if (currentOrderStatus === updateOrderStatus) {
      console.log(
        `Order(s) for ${tracker.tracking_code} already have status ${updateOrderStatus}. No update needed.`
      );
      return res.status(200).json({ message: 'No status change needed.' });
    }

    // If labOrders exist, update them as well
    if (labOrders && labOrders.length > 0) {
      await supabaseAdmin
        .from('lab_order')
        .update({
          status: updateOrderStatus || alternativeOrderStatus,
          date_delivered:
            (updateOrderStatus || alternativeOrderStatus) === 'DELIVERED'
              ? format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx")
              : null,
        })
        .throwOnError()
        .in(
          'id',
          labOrders.map(o => o.id)
        );

      if ((updateOrderStatus || alternativeOrderStatus) === 'DELIVERED') {
        await deliveredEvent(
          labOrders[0].patient_id!,
          supabaseAdmin,
          labOrders[0]
        );
      }
    }

    await supabaseAdmin
      .from('order')
      .update({
        shipment_details: tracker.status,
        order_status: updateOrderStatus || alternativeOrderStatus,
      })
      .throwOnError()
      .in(
        'id',
        orders.map(o => o.id)
      );

    console.log(
      `Successfully updated orders for tracking number: ${tracker.tracking_code}`
    );
    res.status(200).json({
      message: `Successfully updated orders: ${
        labOrders && labOrders.length > 0
          ? labOrders.map(o => o.id).join(',')
          : orders.map(o => o.id).join(',')
      } with shipping_details: ${tracker.status}`,
    });
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`, err);
    res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }
};

export default webhookHandler;
