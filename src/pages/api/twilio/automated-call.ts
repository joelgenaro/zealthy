import type { NextApiRequest, NextApiResponse } from 'next';
import {
  missingIntakeAnswered,
  idMissingAnswered,
  failedPaymentAnswered,
} from './call_scripts';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);

type MessageType = 'incomplete' | 'idMissing' | 'failedPayment';

export default async function CreatePatientHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    phone_number,
    message,
  }: { phone_number: string; message: MessageType } = JSON.parse(req.body);

  const calls = {
    incomplete: missingIntakeAnswered,
    idMissing: idMissingAnswered,
    failedPayment: failedPaymentAnswered,
  };

  const voicemails = {
    incomplete: 'voicemail-message',
    idMissing: 'voicemail-identity',
    failedPayment: 'voicemail-payment',
  };

  try {
    if (phone_number) {
      await client.calls
        .create({
          twiml: calls[message],
          to: phone_number,
          from: process.env.TWILIO_PHONE_NUMBER,
          machineDetection: 'Enable',
          asyncAmd: 'true',
          AsyncAmdStatusCallbackMethod: 'POST',
          asyncAmdStatusCallback: `https://app.getzealthy.com/api/twilio/${voicemails[message]}`,
        })
        .then((call: any) => {
          console.log(call.sid);
        })
        .catch((e: any) => console.log(e));
    }
    res.status(200).json('Success');
  } catch (err: any) {
    console.log(err, 'error');
    res.status(500).json(err?.message || 'There was an unexpected error');
  }
}
