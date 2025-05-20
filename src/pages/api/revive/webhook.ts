import type { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabase';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { carriers } from '@/utils/carriers';

export default async function ReviveWebhookHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const supabase = getServiceSupabase();

    const { event_data } = req.body;

    const getTrackingURL = (trackingNumber: string) => {
      const found = carriers.find(c => c.reg.test(trackingNumber));

      if (found) {
        return found.url(trackingNumber);
      }

      return null;
    };

    if (event_data.event === 'shipment.accepted') {
      const trackingUrl = getTrackingURL(event_data.event_data.tracking_id);

      const order = await supabase
        .from('order')
        .select(`*, prescription_id(*)`)
        .eq('revive_entry_id', event_data.electronic_prescription_message_id)
        .throwOnError()
        .limit(1)
        .single();

      console.log({ order });

      const updatedOrder =
        order?.data?.prescription_id?.medication_quantity_id === 98
          ? await supabase
              .from('order')
              .update({
                tracking_number: event_data.event_data.tracking_id,
                tracking_URL: trackingUrl,
              })
              .eq('group_id', order?.data?.group_id)
          : await supabase
              .from('order')
              .update({
                tracking_number: event_data.event_data.tracking_id,
                tracking_URL: trackingUrl,
              })
              .eq('id', order?.data?.id);

      console.log('UPDATED ORDER', updatedOrder);
      if (updatedOrder.status !== 204) {
        throw new Error('Unable to process data');
      }
    }

    return res.status(204).end();
  } catch (e) {
    const errorMessage = getErrorMessage(e);
    console.log('revive_webhook_err', errorMessage);
    return res.status(500).json({ error: (e as Error).message });
  }
}
