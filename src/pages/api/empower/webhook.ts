import type { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabase';
import { getErrorMessage } from '@/utils/getErrorMessage';

export const config = {
  runtime: 'edge',
  api: {
    bodyParser: false,
  },
};

const collectChunks = async (readable: any) => {
  console.log(readable, 'read');
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(chunk);
  }
  return chunks;
};

export default async function EmpowerWebhookHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const supabase = getServiceSupabase();

    const readable = req.body;
    const chunks = await collectChunks(readable);

    // Process the collected chunks as needed
    const fullBody = Buffer.concat(chunks).toString();
    console.log('Complete body:', fullBody);

    const body = JSON.parse(fullBody);

    if (body) {
      const order = await supabase
        .from('order')
        .select(`order_status, tracking_number, tracking_URL`)
        .eq('id', parseInt(body?.ClientOrderId, 10))
        .single();
      const orderParams = {
        tracking_number:
          body?.shipmentLines?.[0]?.shipmentTrackingNumber ||
          order.data?.tracking_number,
        tracking_URL:
          body?.shipmentLines?.[0]?.shipmentTrackingUrl ||
          order.data?.tracking_URL,
        order_status: body?.orderStatus || order.data?.order_status,
      };

      const updatedOrder = await supabase
        .from('order')
        .update(orderParams)
        .eq('empower_order_id', parseInt(body?.eipOrderId, 10));

      if (updatedOrder.status === 204) {
        return new Response(JSON.stringify(updatedOrder), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } else {
        return new Response(
          JSON.stringify('There was an error updating order'),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
