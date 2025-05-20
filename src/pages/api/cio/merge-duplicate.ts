// Merges duplicate accounts in Customer.io based on email address and profile ID

import type { NextApiRequest, NextApiResponse } from 'next';
import { IdentifierType, TrackClient, RegionUS } from 'customerio-node';

export default async function mergeDuplicateCio(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { profileId, email } = req.body;

  if (!profileId || !email) {
    return res.status(400).json({ error: 'Missing profile ID or email' });
  }

  let cio = new TrackClient(
    process.env.CIO_SITE_ID!,
    process.env.CIO_API_KEY!,
    { region: RegionUS }
  );

  const mergedCustomer = await cio.mergeCustomers(
    IdentifierType.Id,
    profileId,
    IdentifierType.Email,
    email
  );

  return res.status(200).json({ mergedCustomer });
}
