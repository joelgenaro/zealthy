import qs from 'qs';
import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function EnterAuthHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    res.setHeader('Cache-Control', 'max-age=86400, s-maxage=86400');

    const data = {
      grant_type: 'client_credentials',
      client_id: process.env.ENTER_CLIENT_ID,
      client_secret: process.env.ENTER_CLIENT_SECRET,
    };

    const tokenOptions = {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      data: qs.stringify(data),
      url: process.env.ENTER_BASE_URL + '/oauth/token/',
    };

    const token_response = await axios(tokenOptions);

    const token = token_response.data.access_token;

    if (!token) {
      return res.status(500).json({
        error: 'No Enter auth access token',
      });
    } else {
      res.status(200).json(token);
    }
  } catch (error: any) {
    res.status(500).json(error?.message || 'There was an unexpected error');
  }
}
