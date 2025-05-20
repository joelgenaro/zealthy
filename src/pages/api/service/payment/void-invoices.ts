import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import type { NextApiRequest, NextApiResponse } from 'next';
import getStripeInstance from '../../stripe/createClient';

export default async function voidPatientInvoices(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  try {
    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    const { patientId } = req.body as { patientId: number };

    // check if paymentProfile exist
    const customer_id = await supabase
      .from('payment_profile')
      .select('customer_id')
      .eq('patient_id', patientId)
      .single()
      .then(({ data }) => data?.customer_id);

    if (!customer_id) {
      console.info(`Could not find customer_id for patient: ${patientId}`);
      res.status(200).json({
        paymentMethod: null,
      });
      return;
    }

    const openInvoices = await stripe.invoices.list({
      customer: customer_id,
      status: 'open',
    });

    const invoices = openInvoices.data.map(async invoice => {
      await stripe.invoices.voidInvoice(invoice.id);
    });

    const { error } = await supabase
      .from('invoice')
      .update({ status: 'void' })
      .eq('status', 'open');

    if (error) {
      console.error('Error updating invoices in db:', error);
      return { success: false, error };
    }

    await Promise.all(invoices)
      .then(() => {
        const message = `Successfully voided invoices: ${openInvoices.data
          .map(invoice => invoice.id)
          .join(' ,')}`;

        console.log(message);

        res.status(200).json({
          message,
        });
      })
      .catch(err => {
        throw new Error(err);
      });
  } catch (err) {
    console.error('voidPatientInvoicesErr', err);
    res.status(400).json({ message: (err as Error).message });
  }
}
