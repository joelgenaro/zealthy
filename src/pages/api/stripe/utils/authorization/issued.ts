import getStripeInstance from '../../createClient';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function issueAuthorization(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  try {
    const { stripeCustomerId, unpaidInvoices } = req.body;
    const stripeUser: any = await stripe.customers.retrieve(stripeCustomerId);
    if (!stripeUser || stripeUser.deleted) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    if (!unpaidInvoices) {
      return res.status(404).json({ error: 'No unpaid invoices' });
    }

    const outstandingBalanceTotal: number | undefined = unpaidInvoices?.reduce(
      (total: number, invoice: any) => total + (invoice?.amount_due ?? 0),
      0
    );

    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: (outstandingBalanceTotal ?? 0) * 100,
    //   currency: 'usd',
    //   customer: stripeUser?.id,
    //   payment_method: stripeUser?.invoice_settings?.default_payment_method,
    //   capture_method: 'manual',
    //   confirm: true,
    // });
    // console.log('payment intent', paymentIntent);

    // if (paymentIntent.status === 'requires_capture') {
    console.log('Card has sufficent funds');

    const chargePromisesArray = [];
    for (const invoice of unpaidInvoices) {
      if (invoice.status === 'open' && invoice.amount_paid === 0) {
        try {
          const charge = await stripe.invoices
            .pay(invoice.reference_id)
            .then(charge => ({ status: 'fulfilled', charge }))
            .catch(error => ({
              status: 'rejected',
              error,
              invoiceId: invoice.reference_id,
            }));
          chargePromisesArray.push(charge);
        } catch (error) {
          console.error(
            `Failed to pay invoice ${invoice.reference_id}:`,
            error
          );
        }
      }
    }

    const results = await Promise.all(chargePromisesArray);
    const failedCharges = results.filter(
      result => result.status === 'rejected'
    );
    if (failedCharges.length > 0) {
      return res.status(500).json({ error: 'Failed to charge some invoices' });
    }

    return res.status(200).json({ message: 'Invoices successfully paid' });
    // } else {
    //   console.error(`Authorization failed: ${paymentIntent.status}`);
    // }
  } catch (err: any) {
    return res
      .status(404)
      .json(err?.message || 'There was an unexpected error');
  }
}
