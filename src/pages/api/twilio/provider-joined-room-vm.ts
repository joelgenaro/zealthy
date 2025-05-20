import type { NextApiRequest, NextApiResponse } from 'next';
import { providerJoinedRoomVm } from './call_scripts';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { CallSid, AccountSid, AnsweredBy } = req.body;
  try {
    console.log('ANSWERED', AnsweredBy);
    if (AnsweredBy !== 'human') {
      client
        .calls(CallSid)
        .update({ twiml: providerJoinedRoomVm })
        .then(() => {
          console.log('Call answered and successfully updated');
        })
        .catch((error: any) => {
          console.log(error);
        });
    }

    res.status(200).json('Success');
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json(error?.message || 'There was an unexpected error');
  }
}
