import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Database } from '@/lib/database.types';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { OrderPrescriptionProps } from '@/components/hooks/data';

export default async function AuthorizeOrderHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // const { requester, taskFor, message } = req.body;
    const { action, id } = req.query;
    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );
    if (!id) return res.status(422);
    const orders = await supabase
      .from('order')
      .select(`*, prescription(*)`)
      .eq('patient_id', id)
      .eq('order_status', 'ORDER_PENDING_ACTION')
      .then(({ data }) => data as OrderPrescriptionProps[]);

    const patientStripe = await supabase
      .from('payment_profile')
      .select('customer_id')
      .eq('patient_id', id)
      .single()
      .then(({ data }) => data);
    if (!orders?.length) {
      throw new Error('No orders pending!');
    } else {
      if (action === 'approve') {
        const acceptedOrder =
          (orders?.[0]?.total_price ?? 0) > (orders?.[1]?.total_price ?? 0)
            ? orders[0]
            : orders[1];
        const removedOrder =
          (orders?.[0]?.total_price ?? 0) < (orders?.[1]?.total_price ?? 0)
            ? orders[0]
            : orders[1];

        await supabase
          .from('order')
          .update({ order_status: 'ACCEPTED' })
          .eq('id', acceptedOrder.id);
        const charge = await axios
          .post(
            ['production', 'preview'].includes(process.env.VERCEL_ENV!)
              ? `https://${process.env.VERCEL_URL}/api/service/payment/charge`
              : process.env.VERCEL_URL + '/api/service/payment/charge',
            {
              customerId: patientStripe?.customer_id,
              amount: (acceptedOrder?.total_price ?? 0) * 100,
              description: `${acceptedOrder?.prescription?.medication}`,
              metadata: {
                zealthy_patient_id: id || null,
                zealthy_subscription_id: 5,
                zealthy_order_id: acceptedOrder?.id || null,
                zealthy_care: 'Weight loss',
              },
            }
          )
          .catch(e => console.info('Authorize_med_approve charge err', e));

        console.info('charge', charge);
        if (!charge) {
          await supabase
            .from('order')
            .update({ order_status: 'PAYMENT_FAILED' })
            .eq('id', acceptedOrder?.id);
        } else {
          await supabase
            .from('order')
            .update({
              order_status: 'PAYMENT_SUCCESS',
              amount_paid: acceptedOrder?.total_price ?? 0,
            })
            .eq('id', acceptedOrder?.id);
          axios.post(
            `${process.env.CLINICIAN_PORTAL_URL}/api/compound/compound-order-only`,
            { orderIds: [acceptedOrder?.id] }
          );
        }

        if (removedOrder?.prescription_id) {
          await supabase
            .from('order')
            .delete()
            .eq('prescription_id', removedOrder.prescription_id);
          if (!charge) throw new Error('Payment Failed!');
        }
      }

      if (action === 'deny') {
        const acceptedOrder =
          (orders?.[0]?.total_price ?? 0) < (orders?.[1]?.total_price ?? 0)
            ? orders[0]
            : orders[1];
        const removedOrder =
          (orders?.[0]?.total_price ?? 0) > (orders?.[1]?.total_price ?? 0)
            ? orders[0]
            : orders[1];

        await supabase
          .from('order')
          .update({ order_status: 'ACCEPTED' })
          .eq('id', acceptedOrder.id);

        const charge = await axios
          .post(
            ['production', 'preview'].includes(process.env.VERCEL_ENV!)
              ? `https://${process.env.VERCEL_URL}/api/service/payment/charge`
              : process.env.VERCEL_URL + '/api/service/payment/charge',
            {
              customerId: patientStripe?.customer_id,
              amount: (acceptedOrder?.total_price ?? 0) * 100,
              description: `${acceptedOrder?.prescription?.medication}`,
              metadata: {
                zealthy_patient_id: id || null,
                zealthy_subscription_id: 5,
                zealthy_order_id: acceptedOrder?.id || null,
                zealthy_care: 'Weight loss',
              },
            }
          )
          .catch(e => console.info('Authorize_med_deny charge err', e));

        console.log(charge, 'charge');
        if (!charge) {
          await supabase
            .from('order')
            .update({ order_status: 'PAYMENT_FAILED' })
            .eq('id', acceptedOrder?.id);
        } else {
          await supabase
            .from('order')
            .update({
              order_status: 'PAYMENT_SUCCESS',
              amount_paid: acceptedOrder?.total_price ?? 0,
            })
            .eq('id', acceptedOrder?.id);

          axios.post(
            `${process.env.CLINICIAN_PORTAL_URL}/api/compound/compound-order-only`,
            { orderIds: [acceptedOrder?.id] }
          );
        }
        if (removedOrder?.prescription_id) {
          await supabase
            .from('order')
            .delete()
            .eq('prescription_id', removedOrder.prescription_id);
        }
        if (!charge) throw new Error('Payment Failed!');
      }
    }
    res.status(201).json('Success!');
  } catch (e: any) {
    const errorMessage = e?.message || 'There was an unexpected error';
    console.warn(errorMessage);
    return res.status(500).json(errorMessage);
  }
}
