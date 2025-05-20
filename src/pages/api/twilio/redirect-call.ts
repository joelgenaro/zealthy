import type { NextApiRequest, NextApiResponse } from 'next';
import { redirectCall } from './call_scripts';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);

export default async function CreatePatientHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { CallSid } = req.body;

  try {
    console.log('REDIRECT');
    await client
      .calls(CallSid)
      .update({ twiml: redirectCall })
      .then((call: any) => {
        console.log();
        console.log(call.sid);
      })
      .catch((e: any) => console.log(e));

    res.status(200).json('Success');
  } catch (error: any) {
    console.log(error, 'error');
    res.status(500).json(error?.message || 'There was an unexpected error');
  }
}
