import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { addMinutes } from 'date-fns';
import { NextApiRequest, NextApiResponse } from 'next';
import getStripeInstance from '../stripe/createClient';
const stripe = getStripeInstance();
const BATCH_SIZE = 1;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const signature = req.headers['supabase-signature'];
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;
  // console.log('Received request with signature:', signature);
  if (!signature || !secret || signature !== secret) {
    console.log('Unauthorized request');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const history = await supabaseAdmin
    .from('subscription_cleaning_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
    .then(data => data.data);

  const oneHundredEightyDaysAgo = new Date();
  oneHundredEightyDaysAgo.setDate(oneHundredEightyDaysAgo.getDate() - 180);
  const twelveHoursAgo = new Date();
  twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

  let subs;
  if (!history?.next_page) {
    const query = `-status:\'incomplete\' AND -status:\'incomplete_expired\' AND -status:\'past_due\' AND -status:\'canceled\' AND -status:\'unpaid\' AND created>${Math.round(
      oneHundredEightyDaysAgo.getTime() / 1000
    )} AND created<${Math.round(twelveHoursAgo.getTime() / 1000)}`;
    console.log(query);
    subs = await stripe.subscriptions.search({
      query: query,
      limit: BATCH_SIZE,
    });

    console.log(subs);
    await supabaseAdmin
      .from('subscription_cleaning_history')
      .update({
        next_page: subs.next_page,
      })
      .eq('id', history?.id!);
  } else {
    const query = `-status:\'incomplete\' AND -status:\'incomplete_expired\' AND -status:\'past_due\' AND -status:\'canceled\' AND -status:\'unpaid\' AND created>${Math.round(
      oneHundredEightyDaysAgo.getTime() / 1000
    )} AND created<${Math.round(twelveHoursAgo.getTime() / 1000)}`;
    console.log(query);
    subs = await stripe.subscriptions.search({
      query: query,
      limit: BATCH_SIZE,
      page: history.next_page!,
    });
  }

  const subsToClean = subs.data;
  //   const subsToClean = [
  //     await stripe.subscriptions.retrieve('sub_1QjS6TAO83GerSeclZTfyh8x'),
  //   ];
  for (const sub of subsToClean) {
    let subData;
    console.log('SUB STATUS: ', sub.status);
    if (!['active', 'trialing'].includes(sub.status)) {
      console.log('Subscription is not active');
      continue;
    }
    try {
      subData = await supabaseAdmin
        .from('patient_subscription')
        .select('*')
        .eq('reference_id', sub.id)
        .single()
        .then(({ data }) => data);

      const createdAt = new Date(sub.created * 1000);
      const oneMinBefore = addMinutes(createdAt!, -1).toISOString();
      const oneMinAfter = addMinutes(createdAt!, 1).toISOString();
      console.log(createdAt, oneMinBefore, oneMinAfter);

      if (!subData) {
        console.log('NO SUB DATA');
        const subscription = sub;
        const priceObject = subscription.items.data[0].price;
        const payload = {
          patient_id: Number(subscription.metadata.zealthy_patient_id),
          subscription_id: Number(
            subscription.metadata.zealthy_subscription_id
          ),
          reference_id: subscription.id,
          status: 'active',
          current_period_start: new Date(
            subscription.current_period_start * 1000
          ).toISOString(),
          current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
          ...(subscription?.cancel_at && {
            cancel_at: new Date(subscription.cancel_at * 1000).toISOString(),
          }),
          ...(subscription.metadata?.zealthy_order_id && {
            order_id: parseInt(subscription.metadata.zealthy_order_id, 10),
          }),
          price: priceObject.unit_amount ? priceObject.unit_amount / 100 : null,
          interval: priceObject.recurring?.interval,
          interval_count: priceObject.recurring?.interval_count,
        };
        subData = await supabaseAdmin
          .from('patient_subscription')
          .insert(payload)
          .select('*')
          .single()
          .then(({ data, error }) => {
            console.log(error, 'ERROR!');
            return data;
          });
        console.log('NEW SUB ENTRY CREATED: ', subData);
      }

      console.log('PATIENT ID: ', subData?.patient_id);

      if (
        subData &&
        subData.patient_id &&
        subData.subscription_id &&
        subData.reference_id &&
        subData.price
      ) {
        const subs = await supabaseAdmin
          .from('patient_subscription')
          .select('*')
          .eq('patient_id', subData?.patient_id)
          .eq('subscription_id', subData?.subscription_id)
          .neq('reference_id', subData?.reference_id)
          .gt('created_at', oneMinBefore)
          .eq('price', subData.price)
          .eq('visible', true)
          .eq('status', 'active')
          .lt('created_at', oneMinAfter);
        if (subs?.data?.length! > 0) {
          console.log(subs.data?.length);
          console.log(subData.patient_id);
          const idsToUpdate = await Promise.all(
            subs?.data?.map(async sub => {
              console.log('STATUS OF SUB: ', sub.status);
              return (await stripe.subscriptions.cancel(sub.reference_id)).id;
            }) || []
          );
          console.log('CANCELLED SUBS: ', JSON.stringify(idsToUpdate));
          console.log('PATIENT CLEANED: ', subData.patient_id);
          await supabaseAdmin
            .from('patient_subscription')
            .update({ status: 'canceled', visible: false })
            .in('reference_id', idsToUpdate);
          await supabaseAdmin
            .from('subscription_cleaning_history')
            .update({
              total_cleaned: (history?.total_cleaned || 0) + 1,
            })
            .eq('id', history?.id!);
        } else {
          console.log('NO DUPLICATE SUBS');
        }
      }
    } catch (e) {
      console.log(e, ' ERROR');
    }
  }

  if (subs.data.length > 0 && subs.next_page) {
    await supabaseAdmin
      .from('subscription_cleaning_history')
      .update({
        next_page: subs.next_page,
      })
      .eq('id', history?.id!);
  } else {
    console.log('No more subscriptions to clean!');
  }

  res.status(200).send('OK');
}
