import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import getStripeInstance from '../../createClient';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function changeCard(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  try {
    const supabase = createServerSupabaseClient<Database>({ req, res });

    const { customerId, patient_id, token } = req.body;

    await stripe.customers.update(customerId, {
      source: token?.id,
    });

    if (customerId && token.card.id) {
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method: token.card.id,
        metadata: {
          client_facing: 'true',
          origin_url: process.env.VERCEL_URL!,
        },
      });

      await stripe.setupIntents.confirm(setupIntent.id).catch(() => {
        // reject card if setupIntents fails (could violate prepaid rule or other)
        throw new Error(
          'This card is not supported. Please try another payment method in order to get your care or prescription from Zealthy. Keep in mind Zealthy does not allow prepaid cards.'
        );
      });
    }

    const openInvoices = await stripe.invoices.list({
      customer: customerId,
      status: 'open',
    });

    let invoiceError = false;
    const invoices = openInvoices.data.map(async invoice => {
      await stripe.invoices
        .pay(invoice.id, {
          payment_method: token.card.id,
        })
        .catch(() => {
          invoiceError = true;
        });
    });

    await Promise.all(invoices);

    if (invoiceError) {
      throw new Error(
        'This card failed to cover your existing balance. Please try another payment method in order to get your care or prescription from Zealthy.'
      );
    }

    const updatePaymentProfile = await supabase
      .from('payment_profile')
      .update({ last4: token?.card?.last4 })
      .match({ customer_id: customerId, patient_id });

    if (updatePaymentProfile.status === 204) {
      res.status(200).json('Successfully updated payment');
    } else {
      throw new Error('There was an error updating default credit card.');
    }
  } catch (err) {
    console.error('update-pay-method-err', err);
    res.status(400).json({ message: (err as Error).message });
  }
}
