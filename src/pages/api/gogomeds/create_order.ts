import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function GogoMedsCreateOrderHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { order, token } = JSON.parse(req.body);

    const gogoOrderParams = {
      method: 'POST',
      url: `${process.env.GOGOMEDS_BASE_URL}/api/affiliate/SubmitOrder`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: order,
    };
    const gogoOrder = await axios(gogoOrderParams).then(res => res.data);

    if (gogoOrder.success) {
      return res.status(200).json(gogoOrder);
    } else {
      return res.status(500).json(gogoOrder);
    }
  } catch (error: any) {
    res.status(500).json(error?.message || 'There was an unexpected error');
  }
}
