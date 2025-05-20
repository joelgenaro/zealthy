import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextApiRequest, NextApiResponse } from 'next';
import { processBoothwynPharmacyOrder } from '../stripe/utils/payment/helpers/processBoothwynPharmacyOrder';
import { OrderPrescriptionProps, PatientProps } from '@/components/hooks/data';
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
  console.log('Fetching orders from Supabase...');
  const orders = await supabaseAdmin
    .from('prescription')
    .select('*, order!inner(*), patient!inner(dosespot_patient_id)')
    .eq('pharmacy', 'Boothwyn')
    .is('order.boothwyn_case_id', null)
    .or('order_status.ilike.%PREPAID_REFILL%,order_status.eq.PAYMENT_SUCCESS', {
      referencedTable: 'order',
    })
    .not('patient.dosespot_patient_id', 'is', null)
    .gte('order.created_at', '2025-03-06')
    .limit(1)
    .then(data => data.data);
  console.log('Fetched orders:', orders?.length);
  const groupIds = new Set(
    orders
      ?.filter(order => order.order[0])
      .map(order => order.order[0].group_id)
  );
  console.log('Group IDs:', Array.from(groupIds));
  const caseIds: Array<string> = [];
  await Promise.all(
    Array.from(groupIds).map(async groupId => {
      console.log('Processing group ID:', groupId);
      const groupedOrders = await supabaseAdmin
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
      console.log(groupedOrders);
      const hasPaymentFailed = groupedOrders.some(
        order => order.order_status === 'PAYMENT_FAILED'
      );
      if (hasPaymentFailed) {
        console.log(
          'Skipping group ID',
          groupId,
          'due to PAYMENT_FAILED order status in one or more orders.'
        );
        await supabaseAdmin
          .from('order')
          .update({
            order_status: 'PAYMENT_FAILED',
          })
          .eq('group_id', groupId!);
        return;
      }
      const patient = await supabaseAdmin
        .from('patient')
        .select('*, profiles(*)')
        .eq('id', groupedOrders?.[0].patient_id!)
        .single()
        .then(data => data.data as PatientProps);
      console.log('Fetched patient for group ID', groupId, ':', patient);
      const address = await supabaseAdmin
        .from('address')
        .select('*')
        .eq('patient_id', groupedOrders?.[0].patient_id!)
        .single()
        .then(data => data.data);
      console.log('Fetched address for group ID', groupId, ':', address);
      const result = await processBoothwynPharmacyOrder(
        patient,
        groupedOrders,
        address!
      );
      console.log(
        'Processed order for group ID',
        groupId,
        ':',
        result.statusText
      );
      caseIds.push(result.data.Results[0].CaseId);
    })
  );
  console.log('All groups processed. Sending response...');
  console.log('RESULTS: ', caseIds);
  res.status(200).json({ status: 'Success!', results: caseIds });
}
