import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextApiRequest, NextApiResponse } from 'next';
import client from '@/lib/easypost/client';
import { formatISO } from 'date-fns';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify the request using a secret key
  const signature = req.headers['supabase-signature'];
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;
  if (!signature || !secret || signature !== secret) {
    console.log('Unauthorized request');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Extract 'orderId' from query parameters for testing specific orders
  const { orderId } = req.query;

  console.log('Fetching orders from Supabase...');

  let orders;

  if (orderId) {
    // Fetch a specific order by ID for testing purposes
    const { data, error } = await supabaseAdmin
      .from('order')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error(`Error fetching order with ID ${orderId}:`, error);
      return res
        .status(500)
        .json({ message: `Error fetching order with ID ${orderId}` });
    }

    if (!data) {
      console.log(`No order found with ID ${orderId}`);
      return res
        .status(404)
        .json({ message: `No order found with ID ${orderId}` });
    }

    // Wrap the single order in an array for consistent processing
    orders = [data];
  } else {
    // Define date ranges for filtering orders between 3 and 90 days ago
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Fetch orders that meet the criteria
    const { data, error } = await supabaseAdmin
      .from('order')
      .select(
        `
        *,
        patient:patient_id (
          profile:profile_id (
            last_name
          )
        )
      `
      )
      .or(
        `order_status.in.(Shipped,SHIPPED,Complete),order_status.ilike.%SENT_TO%`
      )
      .not('tracking_number', 'is', null)
      .not('sent_to_pharmacy_at', 'is', null)
      .gte('sent_to_pharmacy_at', ninetyDaysAgo.toISOString())
      .lte('sent_to_pharmacy_at', threeDaysAgo.toISOString())
      .order('sent_to_pharmacy_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ message: 'Error fetching orders' });
    }

    orders = data;
  }

  console.log('Fetched orders:', orders?.length);

  if (!orders || orders.length === 0) {
    console.log('No orders found to process.');
    return res.status(200).json({ message: 'No orders to process.' });
  }

  // Process each order individually
  for (const order of orders) {
    try {
      // Ensure the order has a 'sent_to_pharmacy_at' date
      if (!order.sent_to_pharmacy_at) {
        console.log(
          `Order ${order.id}: No sent_to_pharmacy_at date. Skipping tracking update.`
        );
        continue;
      }

      // Calculate the number of days since the order was sent to the pharmacy
      const sentToPharmacyAt = new Date(order.sent_to_pharmacy_at);
      const daysSinceShipment =
        (new Date().getTime() - sentToPharmacyAt.getTime()) /
        (1000 * 3600 * 24);

      // Skip orders that are too old (>90 days) or too recent (<3 days)
      if (daysSinceShipment > 90 || daysSinceShipment < 3) {
        console.log(
          `Order ${order.id}: Shipped ${Math.floor(
            daysSinceShipment
          )} days ago. Skipping tracking update.`
        );
        continue;
      }

      // Attempt to retrieve existing tracker(s) from EasyPost for this tracking number
      const trackersResponse = await client.Tracker.all({
        tracking_code: order.tracking_number,
      });

      const trackers = trackersResponse.trackers;

      let tracker;
      if (trackers && trackers.length > 0) {
        // Use the first existing tracker
        tracker = trackers[0];
        console.log(`Order ${order.id}: Found existing tracker ${tracker.id}.`);
      } else {
        // Create a new tracker if none exist
        console.log(
          `Order ${order.id}: No tracker found. Creating new tracker.`
        );
        try {
          tracker = await client.Tracker.create({
            tracking_code: order.tracking_number,
          });
          console.log(`Order ${order.id}: Created new tracker ${tracker.id}.`);
        } catch (createErr: any) {
          // If we hit a duplicate in-flight request error, do not mark as errored
          if (
            createErr.message &&
            createErr.message.includes(
              'A duplicate request is currently in-flight'
            )
          ) {
            console.log(
              `Order ${order.id}: Duplicate in-flight request. Skipping error mark.`
            );
            continue;
          }
          throw createErr;
        }
      }

      console.log(`Order ${order.id} tracking number:`, order.tracking_number);

      const trackerStatus = tracker.status;

      // Format the status to match order status conventions
      const easyPostOrderStatus = trackerStatus.includes(' - ')
        ? trackerStatus.split(' - ')[1]
        : trackerStatus;
      let updateOrderStatus = easyPostOrderStatus
        .toUpperCase()
        .replace(' ', '_');

      const alternativeOrderStatus = trackerStatus.toUpperCase();

      // If UNKNOWN, overwrite with Processing
      if (updateOrderStatus === 'UNKNOWN') {
        console.log(
          `Order ${order.id}: UNKNOWN status found. Overwriting to Processing.`
        );
        updateOrderStatus = 'Processing';
      }

      const updateFields: any = {
        shipment_details: trackerStatus,
        order_status: updateOrderStatus || alternativeOrderStatus,
        errored: false,
        error_details: null,
      };

      console.log(`Order ${order.id} current status:`, order.order_status);
      console.log(
        `Order ${order.id} current shipment details:`,
        order.shipment_details
      );

      try {
        updateFields.delivery_provider = tracker.carrier || null;
      } catch (error) {
        console.error(
          `Order ${order.id}: Error updating delivery_provider:`,
          error
        );
      }

      // Update 'delivered_at_date' if the package has been delivered
      if (
        updateOrderStatus === 'DELIVERED' ||
        alternativeOrderStatus === 'DELIVERED'
      ) {
        try {
          const trackingDetails = tracker.tracking_details;
          if (trackingDetails && trackingDetails.length > 0) {
            const deliveredEvent = trackingDetails.find(
              (detail: any) => detail.status === 'delivered'
            );
            if (deliveredEvent) {
              const deliveredAt = new Date(deliveredEvent.datetime);
              updateFields.delivered_at_date = formatISO(deliveredAt);
            } else {
              console.log(
                `Order ${order.id}: No delivered event found in tracking details.`
              );
            }
          } else {
            console.log(`Order ${order.id}: No tracking details available.`);
          }
        } catch (error) {
          console.error(
            `Order ${order.id}: Error updating delivered_at_date:`,
            error
          );
        }
      }

      await supabaseAdmin.from('order').update(updateFields).eq('id', order.id);

      console.log(`Order ${order.id} updated with fields:`);
      for (const [key, value] of Object.entries(updateFields)) {
        console.log(`  ${key}: ${value}`);
      }
    } catch (err: any) {
      console.error(`Order ${order.id}: Error processing order:`, err);

      await supabaseAdmin
        .from('order')
        .update({
          errored: true,
          error_details: err.message,
        })
        .eq('id', order.id);
    }
  }

  console.log('All orders processed. Sending response...');
  res.status(200).json({ status: 'Success!' });
}
