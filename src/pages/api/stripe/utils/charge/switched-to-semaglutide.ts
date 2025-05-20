import getStripeInstance from '../../createClient';
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function issueTirzepatideRefund(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  try {
    const { orderId, patientId, order, newOrderInfo, stripeCustomerId } =
      req.body;

    const stripeInvoice = await stripe.invoices.list({
      customer: stripeCustomerId,
    });

    const matchingInvoice = stripeInvoice?.data?.find(
      inv => Number(inv.metadata?.zealthy_order_id) === orderId
    );

    let refund;
    if (matchingInvoice) {
      const chargeId = matchingInvoice.charge || '';
      refund = await stripe.refunds.create({
        charge: chargeId as string,
        amount: (matchingInvoice.amount_paid * 35) / 100,
      });
    }

    if (refund?.status === 'succeeded') {
      await supabaseAdmin
        .from('order')
        .update({ order_status: 'CANCELED' })
        .eq('id', orderId);

      const prescription = await supabaseAdmin
        .from('prescription')
        .insert({
          patient_id: patientId,
          clinician_id: order.clinician_id,
          count_of_refills_allowed: 0,
          status: 'active',
          pharmacy: 'Belmar',
          unit: 'Vial',
          dispense_quantity: order.prescription.dispense_quantity || 1,
          requester_canvas_id: order.prescription.requester_canvas_id,
          duration_in_days: order.prescription.duration_in_days,
          medication_quantity_id:
            order.prescription.medication_quantity_id || 98,
          medication: `Semaglutide ${newOrderInfo.dose} mg vial`,
        })
        .select()
        .maybeSingle();

      await supabaseAdmin.from('order').insert({
        patient_id: patientId,
        clinician_id: order.clinician_id,
        prescription_id: prescription.data?.id,
        shipment_method_id: order.shipment_method_id,
        prescription_request_id: order.prescription_request_id,
        total_dose: `Semaglutide ${newOrderInfo.total_dose} mg vial`,
        order_status: 'PENDING',
      });

      if (matchingInvoice?.id) {
        await supabaseAdmin
          .from('invoice')
          .update({
            is_refunded: true,
            refunded_at: new Date().toISOString(),
            description: 'Partial refund - Replaced with semaglutide order',
            amount_paid: order?.amount_paid?.toFixed(2),
          })
          .eq('reference_id', matchingInvoice?.id);
      }
    } else {
      res.status(400).json({
        message: 'Could not update order and issue refund successfully',
      });
    }

    res.status(200).json({
      message: 'Partial refund issued successfully',
      refund,
    });
  } catch (err: any) {
    console.error('switch-to-sem-err', err);
    return res
      .status(404)
      .json(err?.message || 'There was an unexpected error');
  }
}
