import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { format } from 'date-fns';
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import getStripeInstance from '../stripe/createClient';
import { managePaymentUpdate } from '../stripe/utils/payment/update';
import _ from 'lodash';

const stripe = getStripeInstance();
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // const signature = req.headers['supabase-signature'];
  // const secret = process.env.SUPABASE_WEBHOOK_SECRET;

  // if (!signature || !secret || signature !== secret) {
  //   return res.status(401).json({ message: 'Unauthorized' });
  // }
  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
  const twelveHoursAgo = new Date();
  twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);
  const todayDate = format(new Date(), 'yyyy-MM-dd');

  let stripeOpenPaymentIntent: Stripe.PaymentIntent[] = [];

  stripeOpenPaymentIntent = (
    await stripe.paymentIntents.search({
      limit: 25,
      query: `created<${Math.floor(
        twelveHoursAgo.getTime() / 1000
      )} AND created>${Math.floor(oneMonthAgo.getTime() / 1000)}
    AND -status:"succeeded" AND -status:"processing" AND -status:"canceled" AND -metadata["last-dunning"]:"${todayDate}"`,
    })
  ).data;

  const allPIWithDuplicates = [...stripeOpenPaymentIntent];

  // Filter out duplicate payment intents with same customer and amount
  stripeOpenPaymentIntent = _.uniqBy(stripeOpenPaymentIntent, pi => {
    return `${pi.customer}-${pi.amount}`;
  });

  let ignored = 0;

  let paymentIntentResult: PromiseSettledResult<Stripe.PaymentIntent | void>[] =
    [];

  if (stripeOpenPaymentIntent.length! > 0) {
    paymentIntentResult = await Promise.allSettled(
      stripeOpenPaymentIntent.map(
        async (paymentIntent: Stripe.PaymentIntent) => {
          const amountDue = paymentIntent.amount / 100;

          if (
            paymentIntent.invoice ||
            [0, 49, 39, 217, 149, 349].includes(amountDue)
          ) {
            ignored += 1;
            return await stripe.paymentIntents.update(paymentIntent.id, {
              metadata: { 'last-dunning': todayDate },
            });
          }

          // Search for invoices to avoid creating duplicate ones
          const invoices = await stripe.invoices.search({
            query: `
              customer:"${paymentIntent.customer}"
              AND total:${paymentIntent.amount}
              AND created>${Math.floor(oneMonthAgo.getTime() / 1000)}
            `,
          });

          if (invoices.data?.length! > 0) {
            return await stripe.paymentIntents.update(paymentIntent.id, {
              metadata: { 'last-dunning': todayDate },
            });
          }

          const customerPaymentIntents = await stripe.paymentIntents.search({
            query: `
              customer:"${paymentIntent.customer}"
              AND created<${Math.floor(
                twelveHoursAgo.getTime() / 1000
              )} AND created>${Math.floor(oneMonthAgo.getTime() / 1000)}
              AND amount:${amountDue}
              AND -status:"succeeded" AND -status:"processing" AND -status:"canceled"
            `,
          });

          if (customerPaymentIntents.data?.length! > 0) {
            return await stripe.paymentIntents.update(paymentIntent.id, {
              metadata: { 'last-dunning': todayDate },
            });
          }

          if (paymentIntent.status === 'requires_capture') {
            console.log(`capturing payment intent for id: ${paymentIntent.id}`);
            await stripe.paymentIntents.update(paymentIntent.id, {
              metadata: { 'last-dunning': todayDate },
            });
            const result = await stripe.paymentIntents.capture(
              paymentIntent.id
            );

            return result;
          } else {
            console.log(
              `confirming payment intent for id: ${paymentIntent.id}`
            );
            await stripe.paymentIntents.update(paymentIntent.id, {
              metadata: { 'last-dunning': todayDate },
            });

            try {
              const result = await stripe.paymentIntents.confirm(
                paymentIntent.id
              );
              if (result.status === 'succeeded') {
                return result;
              } else {
                throw new Error('Payment intent not succeeded');
              }
            } catch (error) {
              try {
                console.log(
                  'Cannot confirm payment intent, trying to create invoice'
                );
                return await managePaymentUpdate(paymentIntent);
              } catch (error) {
                console.log('Cannot confirm payment intent');
                return paymentIntent;
              }
            }
          }
        }
      )
    );
  }

  try {
    await Promise.all(
      allPIWithDuplicates.map(pi => stripe.paymentIntents.cancel(pi.id))
    );
  } catch (error) {}

  const history = await supabaseAdmin
    .from('dunning_history')
    .select('*')
    .eq('type', 'payment_intent')
    .eq('date', new Date().toDateString())
    .maybeSingle()
    .then(data => data.data);

  if (!history) {
    await supabaseAdmin.from('dunning_history').insert({
      date: new Date().toISOString(),
      first: stripeOpenPaymentIntent[0]?.id,
      last: stripeOpenPaymentIntent[stripeOpenPaymentIntent.length - 1]?.id,
      type: 'payment_intent',
      total_dunned: stripeOpenPaymentIntent.length - ignored,
    });
  } else {
    if (stripeOpenPaymentIntent.length > 0) {
      await supabaseAdmin
        .from('dunning_history')
        .update({
          type: 'payment_intent',
          last: stripeOpenPaymentIntent.at(-1)?.id,
          total_dunned: history
            ? (history?.total_dunned ?? 0) +
              (stripeOpenPaymentIntent.length - ignored)
            : stripeOpenPaymentIntent.length - ignored,
        })
        .eq('id', history.id);
    }
  }

  const result = { fulfilled: -ignored, rejected: 0, ignored };

  paymentIntentResult.forEach(r => {
    result[r.status] += 1;
  });

  res.status(200).json(result);
}
