import { Invoice } from '@/components/hooks/data';
import { supabaseAdmin as supabase, supabaseAdmin } from '@/lib/supabaseAdmin';
import { getUnixTime, subDays } from 'date-fns';
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import getStripeInstance from '../stripe/createClient';
const stripe = getStripeInstance();

type Patient = {
  profile: {
    email: string | null;
  };
};

const FETCH_LIMIT = 100;

const cancelSubscription = async (invoice: Invoice) => {
  const response = await stripe.subscriptions.cancel(invoice.subscription!);
  console.log(response);

  console.log(`Voiding invoice: ${invoice.reference_id}`);
  await stripe.invoices.voidInvoice(invoice.reference_id);

  const customer = await supabase
    .from('patient')
    .select('profile: profiles(email, id)')
    .eq('id', invoice.patient_id)
    .single()
    .then(({ data }) => data?.profile);

  //find last4
  const last4 = await stripe.charges
    .retrieve(invoice.charge!)
    .then(charge => charge.payment_method_details?.card?.last4);

  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription!
  );

  if (customer) {
    console.log(
      Number(subscription?.metadata?.zealthy_subscription_id),
      'SUBSCRIPTION ID'
    );
    const priceToEventName = {
      135: 'payment-failed-weight-loss-cancelled',
      99: 'payment-failed-psychiatric-care-cancelled',
    };
    const body = {
      event:
        Number(subscription?.metadata?.zealthy_subscription_id) === 5
          ? 'payment-failed-prescription-cancelled'
          : priceToEventName[
              Math.round(invoice.amount_due!) as keyof typeof priceToEventName
            ],
      properties: {
        distinct_id: customer.id,
        email: customer.email,
        time: getUnixTime(new Date()),
        last_4: last4,
        token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
        $user_agent:
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
        $current_url: 'https://app.getzealthy.com',
      },
    };
    console.log(body);
    const accountCancelled = await fetch('https://api.perfalytics.com/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    console.log(accountCancelled, 'account-cancelled-comms');
    return;
  }

  console.log(
    `Could not find email address for patient: ${invoice.patient_id}`
  );
  return;
};

const chargeOpenInvoice = async (invoice: Invoice) => {
  if (
    (invoice.amount_due && invoice.amount_due >= 10000_00) ||
    !invoice.description
  ) {
    console.log(
      `Voiding invoice: ${invoice.reference_id} for patient ${invoice.patient_id} -- Invoice does not match criteria`
    );
    return await stripe.invoices.voidInvoice(invoice.reference_id);
  }

  console.log(
    'Attempt count: ',
    invoice.attempted_count + invoice.zealthy_attempts
  );

  // If max attempts have been reached
  const thirtyDaysAgo = subDays(new Date(), 30);
  const fortyFourDaysAgo = subDays(new Date(), 44);

  console.log(
    `INVOICE ${invoice.reference_id} WILL BE CANCELLED: `,
    (invoice.attempted_count + invoice.zealthy_attempts >= 14 &&
      new Date(invoice.created_at) < thirtyDaysAgo) || // Older than 30 days
      new Date(invoice.created_at) < fortyFourDaysAgo
  );
  if (
    (invoice.attempted_count + invoice.zealthy_attempts >= 14 &&
      new Date(invoice.created_at) < thirtyDaysAgo) || // Older than 30 days
    new Date(invoice.created_at) < fortyFourDaysAgo
  ) {
    await supabase
      .from('invoice')
      .update({
        last_zealthy_attempt: new Date().toISOString(),
      })
      .eq('reference_id', invoice.reference_id);

    if (invoice.subscription) {
      console.log(
        `Canceling subscription: ${invoice.subscription} for patient ${invoice.patient_id}`
      );
      return await cancelSubscription(invoice);
    } else {
      console.log(
        `Voiding invoice: ${invoice.reference_id} for patient ${invoice.patient_id} -- Invoice is not for subscription`
      );
      return await stripe.invoices.voidInvoice(invoice.reference_id);
    }
  }

  console.log(
    `Incrementing zealthy_attempts to: ${invoice.zealthy_attempts + 1}`
  );

  await supabase
    .from('invoice')
    .update({
      zealthy_attempts: invoice.zealthy_attempts + 1,
      last_zealthy_attempt: new Date().toISOString(),
    })
    .eq('reference_id', invoice.reference_id);

  await supabaseAdmin.from('dunned_invoices').upsert({
    reference_id: invoice.reference_id,
    amount: invoice.amount_due,
    dunned_at: new Date().toISOString(),
    patient_id: invoice.patient_id,
  });

  console.log(
    `Charging invoice : ${invoice.reference_id} for patient ${invoice.patient_id}`
  );

  return stripe.invoices
    .pay(invoice.reference_id)
    .then((result: any) => {
      console.log('paid invoice: ', result.id);
    })
    .catch((error: any) => {
      console.log('error paying invoice: ', error.message);
    });
};

const chargeInvoices = async (invoices: Invoice[]) => {
  return Promise.allSettled(invoices.map(chargeOpenInvoice)).then(results =>
    results.map(({ status }) => status)
  );
};

const result: { [key: string]: number } = {};

//stripe rate limits

const processBatches = async (invoices: Invoice[], batchSize: number) => {
  for (let i = 0; i < invoices.length; i += batchSize) {
    const batch = invoices.slice(i, i + batchSize);
    const batchResult = await chargeBatch(batch);

    if (Array.isArray(batchResult)) {
      batchResult.forEach(res => {
        //either 'rejected' or 'fulfilled' res
        result[res] = (result[res] || 0) + 1;
      });
    }
  }
};

const chargeBatch = async (batch: Invoice[]) => {
  const res = await chargeInvoices(batch);
  return res;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const signature = req.headers['supabase-signature'];
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;

  if (!signature || !secret || signature !== secret) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const fortyFiveDaysAgo = new Date();
  fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);
  const twelveHoursAgo = new Date();
  twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

  const history = await supabaseAdmin
    .from('dunning_history')
    .select('*')
    .eq('type', 'invoice')
    .eq('date', new Date().toDateString())
    .maybeSingle()
    .then(data => data.data);

  let stripeOpenInvoices;

  if (!history) {
    stripeOpenInvoices = await stripe.invoices.list({
      status: 'open',
      limit: FETCH_LIMIT,
      created: {
        gt: Math.floor(fortyFiveDaysAgo.getTime() / 1000),
        lt: Math.floor(twelveHoursAgo.getTime() / 1000),
      },
    });

    await supabaseAdmin.from('dunning_history').insert({
      date: new Date().toDateString(),
      first: stripeOpenInvoices.data[0].id,
      last: stripeOpenInvoices.data[stripeOpenInvoices.data.length - 1].id,
      type: 'invoice',
    });
  } else {
    stripeOpenInvoices = await stripe.invoices.list({
      status: 'open',
      limit: FETCH_LIMIT,
      starting_after: history.last!,
      created: {
        gt: Math.floor(fortyFiveDaysAgo.getTime() / 1000),
        lt: Math.floor(twelveHoursAgo.getTime() / 1000),
      },
    });
  }

  // Process all invoices
  const filteredInvoices = stripeOpenInvoices.data.filter(
    (invoice: Stripe.Invoice) => {
      const amountDue = invoice.amount_due / 100;

      return ![0, 49, 39, 217, 149, 349].includes(amountDue);
    }
  );

  console.log('INVOICES FOUND: ', filteredInvoices.length);

  const matchedInvoices = await supabase
    .from('invoice')
    .select('*')
    .in(
      'reference_id',
      filteredInvoices.map((i: Stripe.Invoice) => i.id)
    )
    .then(data => data.data);

  const INVOICE_BATCH_SIZE = 50;
  if (matchedInvoices?.length! > 0) {
    await processBatches(
      matchedInvoices as unknown as Invoice[],
      INVOICE_BATCH_SIZE
    );
  }

  if (filteredInvoices.length > 0) {
    await supabaseAdmin
      .from('dunning_history')
      .update({
        last: stripeOpenInvoices.data[stripeOpenInvoices.data.length - 1].id,
        total_dunned: history
          ? history?.total_dunned! + filteredInvoices.length
          : filteredInvoices.length,
      })
      .eq('date', new Date().toDateString())
      .eq('type', 'invoice');
  }
  console.log({ result });

  res.status(200).json({ ...result });
}
