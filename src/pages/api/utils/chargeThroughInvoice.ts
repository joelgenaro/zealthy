import getStripeInstance from '../stripe/createClient';

type Options = {
  description: string;
  metadata?: Record<string, any>;
  amount: number;
  currency?: string;
  patientId: number;
};

export const chargeThroughInvoice = async (
  customerId: string | null,
  options: Options
) => {
  const stripe = getStripeInstance();

  if (!customerId) {
    throw new Error(
      `Patient ${options.patientId} does not have stripe customer id`
    );
  }

  try {
    // create invoice
    const stripeInvoice = await stripe.invoices.create({
      customer: customerId,
      auto_advance: true,
      collection_method: 'charge_automatically',
      description: options.description,
      metadata: options.metadata,
    });

    if (!stripeInvoice) {
      throw new Error(`Could not create invoice for customer: ${customerId}`);
    }

    //create invoice item
    await stripe.invoiceItems.create({
      customer: customerId,
      amount: options.amount,
      currency: options.currency || 'usd',
      invoice: stripeInvoice.id,
    });

    //pay invoice
    const invoice = await stripe.invoices
      .finalizeInvoice(stripeInvoice.id)
      .then(invoice => {
        if (invoice.status === 'paid') {
          const message = `Invoice ${invoice.id} has been paid already for amount of $${invoice.amount_paid}. Returning`;
          console.log(message, {
            message,
            zealthy_patient_id: options.patientId,
          });

          return invoice;
        }

        return stripe.invoices.pay(stripeInvoice.id);
      });

    return invoice.status === 'paid' ? 'success' : 'failed';
  } catch (err) {
    return 'failed';
  }
};
