import axios, { AxiosError } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

const payment_method = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(500).json({
      message: 'Sorry, only POST requests are accepted.',
    });
    return;
  }

  try {
    const { name, expiration, cvc, number } = req.body;
    const response = await axios({
      method: 'post',
      url: `${process.env.STRIPE_BASE_URL}/v1/payment_methods`,
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET}` },
      params: {
        type: 'card',
        billing_details: { name },
        card: {
          exp_month: expiration.split('/')[0],
          exp_year: `20${expiration.split('/')[1]}`,
          cvc,
          number,
        },
      },
    });

    res.status(200).json(response.data);
  } catch (err) {
    res
      .status(500)
      .json((err as AxiosError<{ error: Error }>).response?.data.error.message);
  }
};

export default payment_method;
