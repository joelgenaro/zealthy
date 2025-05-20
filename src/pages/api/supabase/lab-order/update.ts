import { Database } from '@/lib/database.types';
import client from '@/lib/easypost/client';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getKeys } from '@/utils/getKeys';
import { AxiosError, isAxiosError } from 'axios';
import { format } from 'date-fns';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseWebhookHandlerWrapper } from '../../wrappers/supabaseWebhookWrapper';
import { shippedMessage } from '@/utils/lab-orders/deliveredMessage';

type LabOrder = Database['public']['Tables']['lab_order']['Row'];

type UpdatePayload = {
  type: 'UPDATE';
  table: string;
  schema: string;
  record: LabOrder;
  old_record: LabOrder;
};

const handleTracking = async (order: LabOrder) => {
  console.log({
    message: `Creating a tracker for order: ${order.id}. Tracking number is: ${order.tasso_tracking_number}.`,
  });

  try {
    await supabaseAdmin
      .from('lab_order')
      .update({
        date_shipped: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx"),
        status: 'inTransitToPatient',
      })
      .eq('id', order.id);

    await client.Tracker.create({
      tracking_code: order.tasso_tracking_number,
    });
  } catch (err) {
    console.log({ ERROR: err, ORDER: order.id });
    throw err;
  }
};

const handleUpdateLabOrder = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { record, old_record } = req.body as UpdatePayload;

  try {
    const changedAttributes = getKeys(old_record).filter(
      key => old_record[key] !== record[key]
    );

    console.log({
      message: `Lab Order: ${
        record.id
      } has been updated with ${changedAttributes.join(', ')}`,
      zealthy_patient_id: record.patient_id,
      zealthy_lab_order_id: record.id,
    });

    console.log('RECORD', record);
    console.log('OLD RECORD', old_record);
    if (record.tasso_tracking_number !== old_record.tasso_tracking_number) {
      await handleTracking(record);
      await shippedMessage(record.patient_id!, supabaseAdmin, record);
    }

    res.status(200).json({ message: 'OK' });
  } catch (err: any) {
    let message = (err as Error).message;

    if (isAxiosError(err)) {
      message = JSON.stringify((err as AxiosError).response?.data);
    }

    supabaseAdmin
      .from('lab_order')
      .update({
        errored: true,
        error_details: message,
      })
      .eq('id', record.id);

    res.status(422).json({
      error: err?.message || 'There was an unexpected error',
    });
  }
};

export default async function UpdateLabLorder(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return supabaseWebhookHandlerWrapper(req, res, handleUpdateLabOrder);
}
