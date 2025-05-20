import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabase';

export default async function BoothwynWebhookHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const supabase = getServiceSupabase();

    // Check for valid signature
    if (
      req.headers['boothwyn-signature'] !==
      process.env.BOOTHWYN_WEBHOOK_SECRET_KEY
    ) {
      return res.status(403).json({ message: 'Authentication failed' });
    }

    const body = req.body;
    console.log(
      'Boothwyn webhook: Received request body with keys:',
      Object.keys(body)
    );

    // Validate payload
    if (!body.caseId) {
      console.log('Boothwyn webhook: Missing required caseId in body');
      return res.status(400).json({ message: 'Missing required caseId' });
    }

    // Fetch orders with matching caseId
    const { data: orders, error } = await supabase
      .from('order')
      .select('order_status, tracking_number, tracking_URL, boothwyn_case_id')
      .eq('boothwyn_case_id', body.caseId);

    if (error) {
      console.log('Boothwyn webhook: Error fetching orders:', error);
      return res.status(500).json({ message: 'Error fetching order(s)' });
    }

    if (!orders || orders.length === 0) {
      console.log('Boothwyn webhook: No orders found for provided caseId');
      return res.status(404).json({ message: 'No orders found' });
    }

    console.log(`Boothwyn webhook: Found ${orders.length} order(s) to update`);

    for (const order of orders) {
      // Prepare updated fields for each order
      const updatedOrderParams = {
        tracking_number: body.trackingNumber || order.tracking_number,
        tracking_URL: body.trackingURL || order.tracking_URL,
        order_status: body.rxStatus || order.order_status,
      };
      console.log(
        'Boothwyn webhook: Updated order params:',
        updatedOrderParams
      );

      // Update the order
      const { error: updateError } = await supabase
        .from('order')
        .update(updatedOrderParams)
        .eq('boothwyn_case_id', body.caseId);

      if (updateError) {
        console.error('Boothwyn webhook: Error updating order:', updateError);
        return res.status(500).json({ message: 'Error updating order(s)' });
      }

      // Success
      return res.status(200).json({ message: 'Order(s) updated successfully' });
    }
  } catch (error) {
    console.error('Boothwyn webhook: Error handling webhook:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
