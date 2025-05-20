import type { NextApiRequest, NextApiResponse } from 'next';
import {
  patientAppointmentReminderFour,
  patientAppointmentReminderOne,
  patientAppointmentReminderThree,
  patientAppointmentReminderTwo,
} from '../call_scripts';
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const voicemails = [
  patientAppointmentReminderOne,
  patientAppointmentReminderTwo,
  patientAppointmentReminderThree,
  patientAppointmentReminderFour,
];

export default async function CreatePatientHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { CallSid, AccountSid, AnsweredBy } = req.body;
  const { num } = req.query;
  const voicemail = voicemails[Number(num) - 1];
  try {
    console.log('ANSWERED', AnsweredBy);
    if (AnsweredBy !== 'human') {
      client
        .calls(CallSid)
        .update({ twiml: voicemail })
        .then(() => {
          console.log('Call answered and successfully updated');
        })
        .catch((error: any) => {
          console.log(error);
        });
    }

    res.status(200).json('Success');
  } catch (error: any) {
    console.log(error, 'error');
    res.status(500).json(error?.message || 'There was an unexpected error');
  }
}
