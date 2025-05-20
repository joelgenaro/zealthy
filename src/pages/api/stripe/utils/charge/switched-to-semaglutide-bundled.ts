import getStripeInstance from '../../createClient';
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Stripe from 'stripe';

export default async function issueTirzepatideRefund(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  try {
    const {
      orderId,
      patientId,
      order,
      newOrderInfo,
      stripeCustomerId,
      tirzepatideBundleSubscription,
    } = req.body;

    const stripeSubscription: Stripe.Subscription =
      await stripe.subscriptions.retrieve(
        tirzepatideBundleSubscription.reference_id as string
      );

    let latestPaidInvoice;

    if (stripeSubscription.status === 'trialing') {
      const stripeInvoice = await stripe.invoices.list({
        customer: stripeCustomerId,
      });
      latestPaidInvoice = stripeInvoice?.data?.find(
        inv => Number(inv.amount_paid) === 34900
      );
    } else {
      latestPaidInvoice = await stripe.invoices.retrieve(
        stripeSubscription?.latest_invoice as string
      );
    }

    let refund;
    if (latestPaidInvoice) {
      const chargeId = latestPaidInvoice.charge || '';
      refund = await stripe.refunds.create({
        charge: chargeId as string,
        amount: 152 * 100,
      });
    }

    if (refund?.status === 'succeeded') {
      await stripe.subscriptions.update(stripeSubscription.id as string, {
        items: [
          {
            id: stripeSubscription.items.data[0].id,
            price: 'price_1NudYDAO83GerSecwJSW28y6',
          },
        ],
      });

      await supabaseAdmin
        .from('patient_subscription')
        .update({ price: 297 })
        .eq('reference_id', stripeSubscription.id);

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

      if (latestPaidInvoice?.id) {
        await supabaseAdmin
          .from('invoice')
          .update({
            is_refunded: true,
            refunded_at: new Date().toISOString(),
            description: 'Partial refund - Replaced with semaglutide order',
            amount_paid: order?.amount_paid?.toFixed(2),
          })
          .eq('reference_id', latestPaidInvoice?.id);
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
    console.error('switched-to-sem-bun-err', err);
    return res
      .status(404)
      .json(err?.message || 'There was an unexpected error');
  }
}
