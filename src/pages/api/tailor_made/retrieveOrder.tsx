import type { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabase';

import axios from 'axios';

export default async function GogoMedsWebhookHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const supabase = getServiceSupabase();
    const { tmcOrderId } = req.body;
    console.log(req.body.tmcOrderId, 'TMCOrderId');
    const order = await supabase
      .from('order')
      .select(
        `*, prescription (duration_in_days, medication, patient (profiles (email)))`
      )
      .eq('tmc_order_id', tmcOrderId)
      .single()
      .then(({ data }) => data);

    const data = new URLSearchParams();
    data.append('AuthorizationKey', `${process.env.TAILOR_MADE_AUTH_KEY}`);
    data.append('OrderId', tmcOrderId);

    const tailorMadeParams = {
      method: 'POST',
      url: `${process.env.TAILOR_MADE_BASE_URL}/api/zealthy_integration.asmx/RetrieveOrderStatus`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data,
    };
    console.log('tailor_made_params', tailorMadeParams);

    const tailorMadeOrder = await axios(tailorMadeParams);
    console.log('ORDER_RETRIEVED', tailorMadeOrder.data.shipments);

    const orderParams = {
      order_status: tailorMadeOrder.data?.order_status || order?.order_status,
      tracking_number:
        tailorMadeOrder.data.shipments.slice(-1)[0]?.tracking_no ||
        order?.tracking_number,
      tracking_URL:
        tailorMadeOrder.data.shipments.slice(-1)[0]?.tracking_url ||
        order?.tracking_url,
    };

    const updatedOrder = await supabase
      .from('order')
      .update(orderParams)
      .eq('tmc_order_id', tmcOrderId);

    if (updatedOrder.status === 204) {
      res.status(200).json(updatedOrder);
    } else {
      res.status(500).json('Error updating order from TMC meds');
    }
  } catch (err: any) {
    console.error(err?.message || 'There was an unexpected error', err);
    res.status(500).json(err?.message || 'There was an unexpected error');
  }
}
