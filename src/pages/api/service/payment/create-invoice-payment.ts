import { Database } from '@/lib/database.types';
import { CreateInvoicePaymentRequest } from '@/types/api/create-payment-intent';
import { StripeError } from '@stripe/stripe-js';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';
import getStripeInstance from '../../stripe/createClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  let invoiceId;

  try {
    let {
      patientId,
      amount,
      metadata,
      description,
      doNotCharge,
      idempotencyKey,
    } = req.body as CreateInvoicePaymentRequest;

    // create supabase client
    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    if (doNotCharge) {
      description = description + ' [DO NOT CHARGE]';
    }

    const customer_id = await supabase
      .from('payment_profile')
      .select('customer_id')
      .eq('patient_id', patientId)
      .single()
      .then(({ data }) => data?.customer_id);

    if (!customer_id) {
      const message = `Could not find stripe "customer_id" for patient: ${patientId}`;
      console.log({
        level: 'error',
        message,
      });

      throw new Error(message);
    }

    const invoice = await stripe.invoices.create(
      {
        customer: customer_id,
        auto_advance: doNotCharge ? false : true,
        collection_method: 'charge_automatically',
        description: description ? description : 'Zealthy Charge',
        metadata: {
          client_facing: 'true',
          origin_url: process.env.VERCEL_URL!,
          ...(metadata || {}),
        },
      },
      { idempotencyKey }
    );

    invoiceId = invoice.id;

    await stripe.invoiceItems.create({
      customer: customer_id,
      amount: amount,
      currency: 'usd',
      invoice: invoice?.id,
    });

    if (doNotCharge) {
      return res.status(200).json('Successfully created invoice');
    }

    await stripe.invoices.finalizeInvoice(invoice?.id);

    const payInvoice = await stripe.invoices.pay(invoice?.id);

    if (payInvoice.status === 'paid') {
      return res.status(200).json({
        message: 'Successfully charged payment',
        invoiceId: invoiceId,
      });
    } else {
      await stripe.invoices.voidInvoice(invoice?.id);
      console.info('ChargeError-createinvoicepayment', JSON.stringify(invoice));
      return res.status(500).json('There was an error charging payment');
    }
  } catch (err) {
    await stripe.invoices.voidInvoice(invoiceId || '');
    console.error('create-invoice-payment-err', err);
    res.status(500).json({
      message: (err as StripeError).message || 'Failed',
      error: err,
    });
  }
}
