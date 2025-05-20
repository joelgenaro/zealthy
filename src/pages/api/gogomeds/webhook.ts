import type { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabase';

export default async function GogoMedsWebhookHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const supabase = getServiceSupabase();

    if (
      req.headers['gogomeds-signature'] !==
      process.env.GOGOMEDS_WEBHOOK_SECRET_KEY
    ) {
      return res.status(403).json('GoGo Meds Authentication failed!');
    }
    console.log(req.body?.Value?.ShipDetail, 'shippin details');

    let order = await supabase
      .from('order')
      .select(
        `*, prescription (duration_in_days, medication, patient (profiles (email)))`
      )
      .eq('gogo_order_id', parseInt(req.body?.Value?.OrderId, 10))
      .limit(1)
      .maybeSingle()
      .then(({ data }) => data);

    if (!order) {
      order = await supabase
        .from('order')
        .select(
          `*, prescription (duration_in_days, medication, patient (profiles (email)))`
        )
        .eq(
          'id',
          parseInt(
            req.body?.Value?.AffiliateOrderNumber?.replace('ZTH-', ''),
            10
          )
        )
        .limit(1)
        .maybeSingle()
        .then(({ data }) => data);
    }

    const orderParams = {
      order_contact_number:
        req.body?.Value?.OrderContactNumber || order?.order_contact_number,
      tracking_URL: req.body?.Value?.TrackingURL || order?.tracking_URL,
      tracking_number:
        req.body?.Value?.TrackingNumber || order?.tracking_number,
      delivery_provider:
        req.body?.Value?.DeliveryProvider || order?.delivery_provider,
      shipment_method_id:
        req.body?.Value?.ShipmentMethodId || order?.shipment_method_id,
      order_status:
        req.body?.Value?.OrderStatusHistory?.slice(-1)?.[0]?.StatusName ||
        order?.order_status,
      gogo_order_id: parseInt(req.body?.Value?.OrderId, 10),
    };

    console.log(orderParams, 'orderParmas');

    const updatedOrder = await supabase
      .from('order')
      .update(orderParams)
      .eq('id', order?.id);

    console.log(updatedOrder, 'updatedOrder');

    if (updatedOrder.status === 204) {
      res.status(200).json(updatedOrder);
    } else {
      res.status(500).json('Error updating order from GoGo meds');
    }
  } catch (error: any) {
    console.log(error, 'errr');
    res.status(500).json(error?.message || 'There was an unexpected error');
  }
}
