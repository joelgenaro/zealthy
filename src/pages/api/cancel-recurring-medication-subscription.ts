import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import getStripeInstance from './stripe/createClient';

export default async function cancelRecurringMedicationSubscription(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  try {
    const { subscriptionId, patientId } = req.body;

    // cancel subscription on stripw
    const cancelStripeSubscription = await stripe.subscriptions.cancel(
      subscriptionId
    );
    console.log({ 'CANCEL SUBSCRIPTION': cancelStripeSubscription });
    // Update patient medication subscription status to canceled
    await supabaseAdmin
      .from('patient_prescription')
      .update({ status: 'canceled' })
      .eq('reference_id', subscriptionId);
    // update all remaining auto-refill orders to canceled
    await supabaseAdmin
      .from('order')
      .update({
        order_status: 'CANCELED',
      })
      .eq('patient_id', patientId)
      .ilike('order_status', 'AUTO_REFILL_%');

    res.status(200).json({
      message: 'Successfully cancled medication subscription',
    });
  } catch (err: any) {
    console.error({ 'cancel-med-sub-err': err });
    return res
      .status(404)
      .json(err?.message || 'There was an unexpected error');
  }
}
