import { NextApiRequest, NextApiResponse } from 'next';

export const supabaseWebhookHandlerWrapper = (
  req: NextApiRequest,
  res: NextApiResponse,
  callback: (req: NextApiRequest, res: NextApiResponse) => Promise<unknown>
) => {
  const signature = req.headers['supabase-signature'];
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;

  if (!signature || !secret || signature !== secret) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  return callback(req, res);
};
