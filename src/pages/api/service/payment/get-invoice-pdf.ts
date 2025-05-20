import getStripeInstance from '../../stripe/createClient';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function getInvoicePdf(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  if (req.method !== 'POST') return;

  try {
    const { invoiceId } = req.body;
    const invoice = await stripe.invoices.retrieve(invoiceId);
    if (invoice?.invoice_pdf) {
      res.status(200).json(invoice.invoice_pdf);
    } else {
      res.status(500).json('There was an error getting invoice pdf');
      console.info('retrieveInvoiceError', JSON.stringify(invoice));
    }
  } catch (err: any) {
    return res
      .status(500)
      .json(err?.message || 'There was an unexpected error');
  }
}
