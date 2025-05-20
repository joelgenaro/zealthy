import { supabaseAdmin } from '@/lib/supabaseAdmin';
import axios from 'axios';
import {
  addDays,
  addHours,
  addMinutes,
  subDays,
  subHours,
  subMinutes,
} from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { NextApiRequest, NextApiResponse } from 'next';
import { handleCommunicationForScheduledVisit } from '../supabase/appointment/_utils/handleCommunicationForScheduledVisit';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const signature = req.headers['supabase-signature'];
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;
  // console.log('Received request with signature:', signature);
  if (!signature || !secret || signature !== secret) {
    console.log('Unauthorized request');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Appointments that start between 7.5 hours and 8 hours in the future
  const eightHours = addHours(new Date(), 8);
  const startOfRange1 = subMinutes(eightHours, 30).toISOString();
  //console.log(startOfRange1, twentyFourHours.toISOString());
  const futureAppointment = await supabaseAdmin
    .from('appointment')
    .select('*, patient(*, profiles(*)), clinician(*, profiles(*))')
    .eq('encounter_type', 'Scheduled')
    .eq('status', 'Confirmed')
    .gt('starts_at', startOfRange1)
    .lt('starts_at', eightHours.toISOString())
    .or(
      `last_automated_call.is.null,last_automated_call.lt.${subHours(
        new Date(),
        2
      ).toISOString()}`
    )
    .limit(1)
    .maybeSingle();

  if (!futureAppointment.data) {
    res.status(200).json({ status: 'Done' });
    return;
  }

  console.log('PATIENT TIMEZONE: ', futureAppointment.data?.patient?.timezone!);
  console.log('PATIENT REGION: ', futureAppointment.data?.patient?.region);
  console.log('PATIENT ID', futureAppointment.data?.patient?.id);

  const now = utcToZonedTime(
    new Date(),
    futureAppointment.data?.patient?.timezone!
  ).getHours();

  console.log(
    utcToZonedTime(new Date(), futureAppointment.data?.patient?.timezone!) +
      'CURRENT TIME FOR PATIENT'
  );

  console.log('CURRENT HOUR FOR PATIENT: ', now);
  if (now < 7 || now >= 22) {
    const appointment = await supabaseAdmin
      .from('appointment')
      .update({ last_automated_call: new Date().toISOString() })
      .eq('id', futureAppointment?.data?.id!)
      .select()
      .single();
    console.log('CALL SKIPPED AT ', appointment.data?.last_automated_call);
    return res
      .status(200)
      .json(
        'It is between 10 PM and 7 AM for this patient. Call has been skipped.'
      );
  }

  console.log(futureAppointment);
  const response = await axios.post(
    'https://' +
      process.env.VERCEL_URL +
      '/api/twilio/patient-appointment-reminders',
    {
      phoneNumber: futureAppointment.data?.patient?.profiles?.phone_number,
      messageNum: 2,
    }
  );
  console.log('PATIENT CALL RESPONSE', response.data);
  const providerCallResponse = await axios.post(
    'https://' +
      process.env.VERCEL_URL +
      '/api/twilio/provider-appointment-reminders',
    {
      phoneNumber: futureAppointment.data?.clinician?.profiles?.phone_number,
      messageNum: 2,
    }
  );

  if (providerCallResponse.data === 'Success' && response.data === 'Success') {
    const appointment = await supabaseAdmin
      .from('appointment')
      .update({ last_automated_call: new Date().toISOString() })
      .eq('id', futureAppointment?.data?.id!)
      .select()
      .single();
    console.log(
      'APPOINTMENT AUTOMATED CALL SENT AT ',
      appointment.data?.last_automated_call
    );
  }

  const [patient, clinician] = await Promise.all([
    supabaseAdmin
      .from('patient')
      .select('profiles!inner(email, id, phone_number)')
      .eq('id', futureAppointment?.data?.patient_id!)
      .throwOnError()
      .maybeSingle()
      .then(({ data }) => data),
    supabaseAdmin
      .from('clinician')
      .select('zoom_link, daily_room, profiles!inner(email, phone_number, id)')
      .eq('id', futureAppointment?.data?.clinician_id!)
      .throwOnError()
      .maybeSingle()
      .then(({ data }) => data),
  ]);

  await handleCommunicationForScheduledVisit(
    futureAppointment.data!,
    patient!,
    clinician!,
    2
  );

  console.log('PROVIDER CALL RESPONSE', providerCallResponse.data);
  res.status(200).json({ futureAppointment, callResponse: response.data });
}
