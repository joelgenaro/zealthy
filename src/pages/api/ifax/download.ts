import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
// import { addMinutes, format } from 'date-fns';
// import {
//   initialMessageEvent,
//   messageEvent,
//   messageNonPHIEvent,
//   messagePrescriptionPendingEvent,
// } from '@/utils/freshpaint/events';
// import { ClinicianProps, PatientProps } from '@/components/hooks/data';
// import { ProviderType } from '@/utils/providerTypes';
// import { getClinicianAlias } from '@/utils/getClinicianAlias';
//import { careTeamGroups } from '@/utils/careTeamGroups';
import axios from 'axios';
//import jsPDF from 'jspdf';
import { decode } from 'base64-arraybuffer';

type ReqBody = {
  jobId: number;
  faxCallLength: number;
  faxCallStart: number;
  faxCallEnd: number;
  faxTotalPages: number;
  success: boolean;
  fromNumber: string;
  toNumber: string;
  code: number;
  message: string;
  faxTransferredPages: number;
  faxStatus: string;
  direction: string;
  retryAttempt: number;
  transactionId: number;
};

const findAndReplace = (array: string[], find: string) =>
  array.find(user => user.includes(find))!.replace(find, '');

export default async function IFaxDownloadHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST')
    return res.status(405).json({ message: 'Method not allowed' });
  try {
    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    const { jobId, transactionId }: ReqBody = req.body;
    if (!jobId) return res.status(500).json('jobId is missing');
    if (!transactionId) return res.status(500).json('transactionId is missing');

    console.log(req.body);

    const downloadParams = {
      method: 'POST',
      url: `${process.env.IFAX_BASE_URL}/customer/inbound/fax-download`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        accessToken: process.env.IFAX_AUTH_KEY,
      },
      data: { jobId, transactionId },
    };
    const download = await axios(downloadParams).then(async res => {
      return res.data;
    });

    const upload = await supabase.storage
      .from('faxes')
      .upload(`${jobId}.pdf`, decode(download.data), {
        contentType: 'application/pdf',
        upsert: true,
      });

    console.log(upload, 'UPDLos');

    res.status(200).json('Success');
  } catch (error: any) {
    res.status(500).json(error?.message);
  }
}
