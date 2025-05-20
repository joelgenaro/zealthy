import { getKeys } from '@/utils/getKeys';
import { Database } from '@/lib/database.types';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseWebhookHandlerWrapper } from '../../wrappers/supabaseWebhookWrapper';
import { handleCompleteOnlineVisit } from './_utils/handleCompleteOnlineVisit';

type OnlineVisit = Database['public']['Tables']['online_visit']['Row'];

type UpdatePayload = {
  type: 'UPDATE';
  table: string;
  schema: string;
  record: OnlineVisit;
  old_record: OnlineVisit;
};

const handleUpdateOnlineVisit = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { record, old_record } = req.body as UpdatePayload;

    const changedAttributes = getKeys(old_record).filter(
      key => old_record[key] !== record[key]
    );

    if (changedAttributes.includes('status') && record.status === 'Completed') {
      await handleCompleteOnlineVisit(record);
    }

    res.status(200).json({ message: 'OK' });
  } catch (err: any) {
    console.error(err);
    res.status(422).json({
      error: err?.message || 'There was an unexpected error',
    });
  }
};

export default async function UpdateOnlineVisit(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return supabaseWebhookHandlerWrapper(req, res, handleUpdateOnlineVisit);
}
