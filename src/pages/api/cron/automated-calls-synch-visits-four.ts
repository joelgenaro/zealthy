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

  // Appointments that start between 15 min and 20 min in the future
  const twentyMinutes = addMinutes(new Date(), 20);
  const startOfRange1 = subMinutes(twentyMinutes, 5).toISOString();
  //console.log(startOfRange1, twentyFourHours.toISOString());
  const futureAppointment = await supabaseAdmin
    .from('appointment')
    .select('*, patient(*, profiles(*)), clinician(*, profiles(*))')
    .eq('encounter_type', 'Scheduled')
    .eq('status', 'Confirmed')
    .gt('starts_at', startOfRange1)
    .lt('starts_at', twentyMinutes.toISOString())
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

  console.log(futureAppointment);
  const response = await axios.post(
    'https://' +
      process.env.VERCEL_URL +
      '/api/twilio/patient-appointment-reminders',
    {
      phoneNumber: futureAppointment.data?.patient?.profiles?.phone_number,
      messageNum: 4,
    }
  );
  console.log('PATIENT CALL RESPONSE', response.data);
  const providerCallResponse = await axios.post(
    'https://' +
      process.env.VERCEL_URL +
      '/api/twilio/provider-appointment-reminders',
    {
      phoneNumber: futureAppointment.data?.clinician?.profiles?.phone_number,
      messageNum: 4,
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
    4
  );

  console.log('PROVIDER CALL RESPONSE', providerCallResponse.data);
  res.status(200).json({ futureAppointment, callResponse: response.data });
}
