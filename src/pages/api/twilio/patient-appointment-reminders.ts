import type { NextApiRequest, NextApiResponse } from 'next';
import {
  patientAppointmentReminderOne,
  patientAppointmentReminderTwo,
  patientAppointmentReminderFour,
  patientAppointmentReminderThree,
} from './call_scripts';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);

const callScripts = [
  patientAppointmentReminderOne,
  patientAppointmentReminderTwo,
  patientAppointmentReminderThree,
  patientAppointmentReminderFour,
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { phoneNumber, messageNum } = req.body;
  console.log(phoneNumber, 'phone');
  try {
    if (phoneNumber) {
      await client.calls
        .create({
          twiml: callScripts[messageNum - 1],
          to: phoneNumber,
          from: process.env.TWILIO_PHONE_NUMBER,
          machineDetection: 'DetectMessageEnd', // Key setting for AMD
          machineDetectionSpeechThreshold: 2400, // Example advanced parameter (in ms)
          machineDetectionSpeechEndThreshold: 1200, // Example advanced parameter (in ms)
          machineDetectionSilenceTimeout: 5000, // Example advanced parameter (in ms)
          AsyncAmdStatusCallbackMethod: 'POST',

          asyncAmdStatusCallback:
            'https://' +
            process.env.VERCEL_URL +
            '/api/twilio/patient-appointment-reminders-vm/' +
            messageNum,
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
