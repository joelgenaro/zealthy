import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Database } from '@/lib/database.types';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { OrderPrescriptionProps } from '@/components/hooks/data';

export default async function ChargeSubmitOrder(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;
    if (!id) return res.status(422);
    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );
    const pendingOrder = await supabase
      .from('order')
      .select(`*, prescription(*)`)
      .eq('patient_id', id)
      .eq('order_status', 'ORDER_PENDING_REACTIVATION')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => data as OrderPrescriptionProps);

    const patientStripe = await supabase
      .from('payment_profile')
      .select('customer_id')
      .eq('patient_id', id)
      .single()
      .then(({ data }) => data);

    if (!pendingOrder) {
      throw new Error('No orders pending!');
    } else {
      await supabase
        .from('order')
        .update({ order_status: 'ACCEPTED' })
        .eq('id', pendingOrder.id);

      const charge = await axios
        .post(
          ['production', 'preview'].includes(process.env.VERCEL_ENV!)
            ? `https://${process.env.VERCEL_URL}/api/service/payment/charge`
            : process.env.VERCEL_URL + '/api/service/payment/charge',
          {
            customerId: patientStripe?.customer_id,
            amount: (pendingOrder?.total_price ?? 0) * 100,
            description: `${pendingOrder?.prescription?.medication}`,
            metadata: {
              zealthy_patient_id: id || null,
              zealthy_subscription_id: 5,
              zealthy_order_id: pendingOrder?.id || null,
              zealthy_care: 'Weight loss',
            },
          }
        )
        .catch(e => console.log('charge_submit_Err', e));

      if (!charge) {
        await supabase
          .from('order')
          .update({ order_status: 'PAYMENT_FAILED' })
          .eq('id', pendingOrder?.id);
      } else {
        await supabase
          .from('order')
          .update({
            order_status: 'PAYMENT_SUCCESS',
            amount_paid: pendingOrder?.total_price ?? 0,
          })
          .eq('id', pendingOrder?.id);
        axios.post(
          `${process.env.CLINICIAN_PORTAL_URL}/api/compound/compound-order-only`,
          { orderIds: [pendingOrder?.id] }
        );
      }

      if (!charge) throw new Error('Payment Failed!');
    }
    res.status(201).json('Success!');
  } catch (e: any) {
    console.warn(e?.message ?? 'Something went wrong');
    res.status(500).json(e?.message ?? 'Something went wrong');
  }
}
