import { Database } from '@/lib/database.types';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseWebhookHandlerWrapper } from '../../wrappers/supabaseWebhookWrapper';
import client from '@/lib/easypost/client';
import { handleShipping } from './_utils/handleShipping';
import { handleSendToLocalPharmacy } from './_utils/handleSendToLocalPharmacy';
import { getKeys } from '@/utils/getKeys';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { format } from 'date-fns';
import { handleGoGoMedsPharmacyOrder } from './_utils/handleGoGoMedsPharmacyOrder';
import { AxiosError, isAxiosError } from 'axios';
import { handleSendToPharmacy } from './_utils/handleSendToPharmacy';

type Order = Database['public']['Tables']['order']['Row'];

type UpdatePayload = {
  type: 'UPDATE';
  table: string;
  schema: string;
  record: Order;
  old_record: Order;
};

const handleTracking = async (order: Order) => {
  console.log(
    `Creating/ensuring a tracker for order: ${order.id}. Tracking number is: ${order.tracking_number}.`
  );

  const pharmacy: string = await supabaseAdmin
    .from('prescription')
    .select('pharmacy')
    .eq('id', order.prescription_id!)
    .single()
    .then(({ data }) => data?.pharmacy ?? '');

  try {
    const columnToFilter =
      order.group_id && pharmacy !== 'Belmar' ? 'group_id' : 'id';
    let shouldCreateTracker = columnToFilter === 'id';
    if (order.group_id) {
      const ordersInGroup = await supabaseAdmin
        .from('order')
        .select('id')
        .eq('group_id', order.group_id)
        .order('id', { ascending: true })
        .then(({ data }) => data);

      if (ordersInGroup?.length && ordersInGroup[0].id === order.id) {
        shouldCreateTracker = true;
      }
    }

    if (shouldCreateTracker) {
      await supabaseAdmin
        .from('order')
        .update({
          date_shipped: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx"),
        })
        .eq(columnToFilter, order[columnToFilter]!);

      const trackerData: any = {
        tracking_code: order.tracking_number,
      };

      if (pharmacy === 'Hallandale') {
        trackerData.carrier = 'FedEx';
      }

      // Check if tracker already exists to prevent duplicate in-flight error
      const existingTrackers = await client.Tracker.all({
        tracking_code: order.tracking_number!,
      });

      if (!existingTrackers.trackers.length) {
        await client.Tracker.create(trackerData);
      } else {
        console.log(
          `Tracker already exists for ${order.tracking_number}. Skipping creation.`
        );
      }
    }
  } catch (err) {
    console.log({ ERROR: err, ORDER: order.id });
    throw err;
  }
};

const handleUpdateOrder = async (req: NextApiRequest, res: NextApiResponse) => {
  const { record, old_record } = req.body as UpdatePayload;
  console.log(`Order update received for order ID: ${record.id}`, record);

  try {
    const changedAttributes = getKeys(old_record).filter(
      key => old_record[key] !== record[key]
    );

    console.log(
      `Order: ${record.id} has been updated with ${changedAttributes.join(
        ', '
      )}`
    );

    if (
      changedAttributes.includes('order_status') &&
      ['PENDING_ORDER', 'PENDING_GOGOMEDS_ORDER'].includes(
        record.order_status || ''
      )
    ) {
      await handleGoGoMedsPharmacyOrder(record);
    }

    if (
      record.tracking_number &&
      record.tracking_number !== old_record.tracking_number
    ) {
      await handleTracking(record);
    }

    if (
      record.shipment_details &&
      record.shipment_details !== old_record.shipment_details
    ) {
      await handleShipping(record);
    }

    if (
      record.order_status === 'SENT_TO_LOCAL_PHARMACY' &&
      old_record.order_status !== record.order_status
    ) {
      await handleSendToLocalPharmacy(record);
    }

    if (
      changedAttributes?.includes('order_status') &&
      record.order_status?.includes('SENT_TO_') &&
      record.order_status !== 'SENT_TO_LOCAL_PHARMACY'
    ) {
      await handleSendToPharmacy(record);
    }

    res.status(200).json({ message: 'OK' });
  } catch (err: any) {
    let message = (err as Error).message;

    if (isAxiosError(err)) {
      message = JSON.stringify((err as AxiosError).response?.data);
    }

    await supabaseAdmin
      .from('order')
      .update({
        errored: true,
        error_details: message,
      })
      .eq('id', record.id);

    console.error({ errInfo: message, errorObj: err });
    res.status(422).json({
      error: err?.message || 'There was an unexpected error',
    });
  }
};

export default async function UpdateOrder(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return supabaseWebhookHandlerWrapper(req, res, handleUpdateOrder);
}
