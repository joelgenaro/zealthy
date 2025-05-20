import getStripeInstance from '../../stripe/createClient';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function changeCard(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  try {
    const { customerId, amount } = req.body;

    // charge patient
    const stripeCharge = await stripe.invoices.create({
      customer: customerId,
      auto_advance: true,
      collection_method: 'charge_automatically',
      description: req.body?.description
        ? req.body?.description
        : 'Zealthy Charge',
      metadata: req.body?.metadata,
    });

    await stripe.invoiceItems.create({
      customer: customerId,
      amount,
      currency: req.body?.currency ? req.body?.currency : 'usd',
      invoice: stripeCharge?.id,
    });

    await stripe.invoices.finalizeInvoice(stripeCharge?.id);
    const payInvoice = await stripe.invoices.pay(stripeCharge?.id);
    console.info('INVOICE_CASH_PAID', payInvoice);

    if (payInvoice.status === 'paid') {
      res.status(200).json('Successfully charged payment');
    } else {
      res.status(500).json('There was an error charging payment.');
      console.info('ChargeError', JSON.stringify(stripeCharge));
    }
  } catch (err: any) {
    return res
      .status(404)
      .json(err?.message || 'There was an unexpected error');
  }
}
