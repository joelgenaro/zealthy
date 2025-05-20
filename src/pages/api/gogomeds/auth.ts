import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function GogoMedsAuthHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const auth = await axios.post(
      `${process.env.GOGOMEDS_BASE_URL}/token`,
      `grant_type=password&username=${process.env.GOGOMEDS_USERNAME}&password=${process.env.GOGOMEDS_PASSWORD}`
    );
    console.log(auth, 'auth');
    res.status(200).json(auth.data.access_token);
  } catch (error: any) {
    res.status(500).json(error?.message || 'There was an unexpected error');
  }
}
