import { supabaseAdmin } from '@/lib/supabaseAdmin';
import appointment from '@/pages/patient-portal/free-consult/appointment';
import axios from 'axios';
import {
  addDays,
  addHours,
  addMinutes,
  subDays,
  subHours,
  subMinutes,
} from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { NextApiRequest, NextApiResponse } from 'next';

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

  const twentyFourHoursAgo = subDays(new Date(), 1);
  const prescriptionRenewal = await supabaseAdmin
    .from('patient_action_item')
    .select('*, patient(*, profiles(*))')
    .eq('type', 'PRESCRIPTION_RENEWAL')
    .eq('completed', false)
    .lt('created_at', new Date().toISOString())
    .gt('created_at', twentyFourHoursAgo.toISOString())
    .is('patient_called_at', null)
    .limit(1)
    .maybeSingle();

  if (!prescriptionRenewal.data) {
    res.status(200).json({ status: 'Done' });
    return;
  }

  console.log(
    'PATIENT TIMEZONE: ',
    prescriptionRenewal.data?.patient?.timezone!
  );
  console.log('PATIENT REGION: ', prescriptionRenewal.data?.patient?.region);
  console.log('PATIENT ID', prescriptionRenewal.data?.patient?.id);

  const now = utcToZonedTime(
    new Date(),
    prescriptionRenewal?.data?.patient?.timezone!
  ).getHours();

  console.log(
    utcToZonedTime(new Date(), prescriptionRenewal.data?.patient?.timezone!) +
      'CURRENT TIME FOR PATIENT'
  );

  console.log('CURRENT HOUR FOR PATIENT: ', now);
  if (now < 7 || now >= 22) {
    await supabaseAdmin
      .from('patient_action_item')
      .update({ patient_called_at: new Date().toISOString() })
      .eq('id', prescriptionRenewal.data?.id!)
      .select()
      .single();
    console.log('CALL SKIPPED AT ', new Date().toLocaleString());
    return res
      .status(200)
      .json(
        'It is between 10 PM and 7 AM for this patient. Call has been skipped.'
      );
  }

  const response = await axios.post(
    'https://' +
      process.env.VERCEL_URL +
      '/api/twilio/prescription-renewal-reminder',
    {
      phoneNumber: prescriptionRenewal.data?.patient?.profiles?.phone_number,
    }
  );

  if (response.data === 'Success') {
    await supabaseAdmin
      .from('patient_action_item')
      .update({ patient_called_at: new Date().toISOString() })
      .eq('id', prescriptionRenewal.data?.id!)
      .select()
      .single();
  }

  res.status(200).json({ prescriptionRenewal, callResponse: response.data });
}
