import { PriorAuth } from '@/components/hooks/data';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseWebhookHandlerWrapper } from '../../wrappers/supabaseWebhookWrapper';
import { handleApprovedPA } from './_utils/handleApprovedPA';

type UpdatePayload = {
  type: 'INSERT';
  table: string;
  schema: string;
  record: PriorAuth;
  old_record: null;
};

const handleCreatePriorAuth = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { record } = req.body as UpdatePayload;

    if (record.status === 'PA Approved') {
      await handleApprovedPA(record);
    }

    res.status(200).json({ message: 'OK' });
  } catch (err: any) {
    console.error(err);
    res.status(422).json({
      error: err?.message || 'There was an unexpected error',
    });
  }
};

export default async function UpdatePriorAuth(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return supabaseWebhookHandlerWrapper(req, res, handleCreatePriorAuth);
}
