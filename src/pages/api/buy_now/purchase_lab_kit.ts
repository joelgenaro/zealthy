import type { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabase';
import getStripeInstance from '@/pages/api/stripe/createClient';
import { getErrorMessage } from '@/utils/getErrorMessage';

export default async function PurchaseLabKitHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  try {
    const supabase = getServiceSupabase();

    const { price, metadata, description, patient } = req.body;

    if (!price || !metadata || !description || !patient?.id) {
      throw new Error('Missing required fields');
    }

    const patientStripe = await supabase
      .from('payment_profile')
      .select('customer_id')
      .eq('patient_id', patient.id)
      .single()
      .then(({ data }) => data);

    if (!patientStripe?.customer_id) {
      throw new Error('Customer ID not found for the patient');
    }

    const stripeInvoice = await stripe.invoices.create({
      customer: patientStripe.customer_id,
      description: description,
      metadata: metadata,
    });

    //create invoice item
    const invoiceItem = await stripe.invoiceItems.create({
      customer: patientStripe.customer_id,
      amount: price * 100,
      currency: 'usd',
      invoice: stripeInvoice.id,
    });

    //pay invoice
    const invoice = await stripe.invoices
      .finalizeInvoice(stripeInvoice.id)
      .then(invoice => {
        if (invoice.status === 'paid') {
          console.log(
            `Invoice ${invoice.id} has been paid already for amount of $${invoice.amount_paid}`,
            { zealthy_patient_id: patient?.id }
          );
          return invoice;
        }
        return stripe.invoices.pay(stripeInvoice.id);
      })
      .catch(async err => {
        const errorMessage = getErrorMessage(err);

        //if  payment failed, void invoice
        await stripe.invoices.voidInvoice(stripeInvoice.id);
        console.error('Invoice_payment_failed', {
          message: errorMessage,
        });
        throw new Error(errorMessage);
      });
    return res.status(200).json('Success');
  } catch (err: any) {
    const errorMessage = getErrorMessage(err);
    console.warn(errorMessage);
    res.status(500).json({ message: errorMessage });
  }
}
