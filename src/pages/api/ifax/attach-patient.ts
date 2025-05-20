import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
//import { addMinutes, format } from 'date-fns';
//  import {
//   initialMessageEvent,
//   messageEvent,
//   messageNonPHIEvent,
//   messagePrescriptionPendingEvent,} from '@/utils/freshpaint/events';
// import { ClinicianProps, PatientProps } from '@/components/hooks/data';
// import { ProviderType } from '@/utils/providerTypes';
// import { getClinicianAlias } from '@/utils/getClinicianAlias';
// import { careTeamGroups } from '@/utils/careTeamGroups';
// import axios from 'axios';
// import jsPDF from 'jspdf';
// import { decode } from 'base64-arraybuffer';

type ReqBody = {
  jobId: number;
  patientId: number;
  category: string;
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

    const { jobId, patientId, category }: ReqBody = req.body;

    const attach = await supabase
      .from('faxes')
      .update({
        patient_id: patientId,
        category,
        internal_status: 'ATTACHED',
      })
      .eq('job_id', jobId);

    const { data, error } = await supabase.storage
      .from('faxes')
      .download(`${jobId}.pdf`);

    if (error) {
      throw new Error();
    }
    if (data) {
      const upload = await supabase.storage
        .from('patients')
        .upload(`/patient-${patientId}/faxes/${jobId}.pdf`, data, {
          contentType: 'application/pdf',
          upsert: true,
        });
      console.log(upload, 'upload');
    }
    console.log(data, error, 'copy');
    res.status(200).json('Success');
  } catch (error: any) {
    res.status(500).json(error?.message);
  }
}
