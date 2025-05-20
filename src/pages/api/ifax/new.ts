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
// import { careTeamGroups } from '@/utils/careTeamGroups';
import axios from 'axios';
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

export default async function IFaxNewHandler(
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

    const {
      jobId,
      faxCallLength,
      faxCallStart,
      faxCallEnd,
      faxTotalPages,
      success,
      fromNumber,
      toNumber,
      code,
      message,
      faxTransferredPages,
      faxStatus,
      direction,
      retryAttempt,
      transactionId,
    }: ReqBody = req.body;

    console.log(req.body);

    const { data, error } = await supabase
      .from('faxes')
      .insert({
        job_id: jobId,
        fax_call_length: faxCallLength,
        fax_call_start: faxCallStart,
        fax_call_end: faxCallEnd,
        fax_total_pages: faxTotalPages,
        success,
        from_number: fromNumber,
        to_number: toNumber,
        code,
        message,
        fax_transferred_pages: faxTransferredPages,
        fax_status: faxStatus,
        direction,
        transaction_id: transactionId,
      })
      .select()
      .maybeSingle();

    console.log(error, 'error');
    if (error) throw new Error(error?.message);
    console.log(data, 'data');
    if (data?.job_id && data?.transaction_id) {
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
      const download = await axios(downloadParams)
        .then(async res => {
          return res.data;
        })
        .catch(e => console.log(e, 'downloadError'));
      console.log(download, 'download');
      const upload = await supabase.storage
        .from('faxes')
        .upload(`${jobId}.pdf`, decode(download.data), {
          contentType: 'application/pdf',
          upsert: true,
        });
      console.log(upload, 'upload');
      if (upload.error) {
        throw new Error(upload.error.toString());
      }
      const { data, error } = await supabase.storage
        .from('faxes')
        .createSignedUrl(`${jobId}.pdf`, 31536000);

      console.log(data, 'data', error, 'errorsignedURL');
      if (error) {
        throw new Error(error.message);
      }
      if (data?.signedUrl) {
        const updateFax = await supabase
          .from('faxes')
          .update({ uploaded_fax: data?.signedUrl })
          .eq('job_id', jobId);

        console.log(updateFax, 'updatedFax');
      }
    }

    res.status(200).json('Success');
  } catch (error: any) {
    res.status(500).json(error?.message);
  }
}
