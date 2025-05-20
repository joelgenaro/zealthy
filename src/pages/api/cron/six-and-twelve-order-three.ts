import { addDays } from 'date-fns';
import {
  OrderPrescriptionProps,
  PatientAddress,
  PatientProps,
} from '@/components/hooks/data';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';
import { NextApiRequest, NextApiResponse } from 'next';
import { sendToPharmacy } from './six-and-twelve-order-two';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const signature = req.headers['supabase-signature'];
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;

  if (!signature || !secret || signature !== secret) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const hundredSeventyDaysAgo = addDays(new Date(), -170).toISOString();
  const hundredEightyDaysAgo = addDays(new Date(), -180).toISOString();

  const futureOrders3 = await supabase
    .from('order')
    .select('*, prescription(*)')
    .eq('order_status', 'FUTURE_ORDER_3')
    .limit(1)
    .lt('created_at', hundredSeventyDaysAgo)
    .gt('created_at', hundredEightyDaysAgo)
    .then(data => data.data);

  console.log(hundredSeventyDaysAgo, hundredEightyDaysAgo);
  console.log(futureOrders3);

  const groupIds = new Set(futureOrders3?.map(order => order.group_id));
  await Promise.all(
    Array.from(groupIds).map(async groupId => {
      console.log('Processing group ID:', groupId);

      // Get grouped orders
      const groupedOrders = await supabase
        .from('order')
        .select('*, prescription(*)')
        .eq('group_id', groupId!)
        .then(({ data }) => (data || []) as OrderPrescriptionProps[]);
      console.log(
        'Grouped orders for group ID',
        groupId,
        ':',
        groupedOrders?.length
      );

      // Do not process if payment is failed
      const hasPaymentFailed = groupedOrders.some(
        order => order.order_status === 'PAYMENT_FAILED'
      );
      if (hasPaymentFailed) {
        console.log(
          'Skipping group ID',
          groupId,
          'due to PAYMENT_FAILED order status in one or more orders.'
        );
        await supabase
          .from('order')
          .update({
            order_status: 'PAYMENT_FAILED',
          })
          .eq('group_id', groupId!);
        return;
      }

      // Get patient
      const patient = await supabase
        .from('patient')
        .select('*, profiles(*)')
        .eq('id', groupedOrders?.[0].patient_id!)
        .single()
        .then(data => data.data as PatientProps);

      // Get address
      const address = await supabase
        .from('address')
        .select('*')
        .eq('patient_id', groupedOrders?.[0].patient_id!)
        .single()
        .then(data => data.data);

      try {
        // Send to pharmacy
        const result = await sendToPharmacy(
          groupedOrders,
          patient,
          address!,
          groupedOrders?.[0].prescription?.pharmacy!
        );
        console.log('Processed order for group ID', groupId, ':', result);
      } catch (e) {
        console.log('ERROR IN SIX AND TWELVE MONTH!', e);
        await supabase
          .from('order')
          .update({
            order_status: 'ERRORED',
            error_details: JSON.stringify(e),
          })
          .eq('group_id', groupId!);
      }
    })
  );
  res.status(200).json({ message: 'Success!' });
}
