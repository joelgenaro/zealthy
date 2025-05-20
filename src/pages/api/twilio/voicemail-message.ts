import type { NextApiRequest, NextApiResponse } from 'next';
import { missingIntakeVoicemail } from './call_scripts';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);

export default async function CreatePatientHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { CallSid, AnsweredBy } = req.body;
  try {
    console.log(`VOICEMAIL SENT TO ${CallSid}`);
    if (AnsweredBy !== 'human') {
      client
        .calls(CallSid)
        .update({ twiml: missingIntakeVoicemail })
        .then(() => {
          console.log('Call answered and successfully updated');
        })
        .catch((error: any) => {
          console.log(error);
        });
    }

    res.status(200).json('Success');
  } catch (error: any) {
    console.warn('voicemail-message-ERR', error);
    res.status(500).json(error?.message || 'There was an unexpected error');
  }
}
