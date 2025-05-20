import { Database } from '@/lib/database.types';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseWebhookHandlerWrapper } from '../../wrappers/supabaseWebhookWrapper';
import { handleGoGoMedsPharmacyOrder } from './_utils/handleGoGoMedsPharmacyOrder';

type Order = Database['public']['Tables']['order']['Row'];

type InsertPayload = {
  type: 'INSERT';
  table: string;
  schema: string;
  record: Order;
  old_record: null;
};

const handleOrderCreation = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { record } = req.body as InsertPayload;

    if (
      ['PENDING_GOGOMEDS_ORDER', 'PENDING_ORDER'].includes(
        record.order_status || ''
      )
    ) {
      await handleGoGoMedsPharmacyOrder(record);

      return res.status(200).json({
        message: 'OK',
      });
    }

    res.status(200).json({
      message: 'OK',
    });
  } catch (err: any) {
    console.error(err);
    res.status(422).json(err?.message || 'There was an unexpected error');
  }
};

export default async function UpdateOrder(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return supabaseWebhookHandlerWrapper(req, res, handleOrderCreation);
}
