import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { LookUpResponse } from '../../v1/samples';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LookUpResponse>
) {
  const { payerName } = req.query;

  const baseUrl =
    process.env.PAYER_LOOK_UP_BASE_URL || process.env.NIRVANA_BASE_URL;

  const { data } = await axios.get(
    `${baseUrl}/v1/lookup?type=payers&jsonParams={%22withCoverageSupportedOnly%22:true,%22fullList%22:true}&search=${payerName}`
  );

  res.status(200).json(data);
}
