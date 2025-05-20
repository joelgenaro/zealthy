import client from '@/lib/easypost/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function TrackingDetails(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { trackingNumber } = req.body;

    const orderTracker = await client.Tracker.all({
      tracking_code: trackingNumber,
    });

    return res
      .status(200)
      .json({ message: 'Tracking information retrieved:', orderTracker });
  } catch (error: any) {
    return res.status(400).json({
      message: 'Error retrieving tracking information:',
      error: error?.message,
    });
  }
}
