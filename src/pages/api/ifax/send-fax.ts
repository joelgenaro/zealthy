import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import axios from 'axios';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';

const upload = multer(); //Multer is used for multipart/formdata & image processing

const runMiddleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
  try {
    await runMiddleware(req, res, upload.single('faxData')); // parse the multipart/formdata
    const { faxNumber, callerId, subject, from_name, to_name, message } =
      req.body;
    const file = (req as any).file;

    if (!file) {
      return res.status(400).json({ error: 'File upload failed.' });
    }

    const formData = new FormData();
    formData.append('faxNumber', faxNumber);
    formData.append('callerId', callerId);
    formData.append('subject', subject);
    formData.append('from_name', from_name);
    formData.append('to_name', to_name);
    formData.append('message', message);
    formData.append('faxData[0][fileName]', file.originalname);
    formData.append(
      'faxData[0][fileUrl]',
      new Blob([file.buffer], { type: file.mimetype }),
      file.originalname
    );
    const response = await axios.post(
      'https://api.ifaxapp.com/v1/customer/fax-send',
      formData,
      {
        headers: {
          accessToken: process.env.IFAX_AUTH_KEY,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    const { jobId } = response.data;

    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('faxes')
      .upload(`${jobId}.pdf`, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });
    if (uploadError) throw new Error(uploadError.message);

    const { data: signedData, error: urlError } = await supabase.storage
      .from('faxes')
      .createSignedUrl(`${jobId}.pdf`, 31536000);

    if (urlError) throw new Error(urlError.message);

    const { error: insertError } = await supabase.from('faxes').insert({
      job_id: jobId,
      success: true,
      from_number: callerId,
      to_number: faxNumber,
      fax_status: 'sent',
      internal_status: 'SENT',
      direction: 'inbound',
      uploaded_fax: signedData.signedUrl,
    });

    if (insertError) throw new Error(insertError.message);

    res.status(200).json({ message: 'Fax sent successfully!' });
  } catch (error) {
    console.error('Error sending fax:', error);
    res.status(500).json({
      error: 'An error occurred while sending the fax.',
    });
  }
};

export default handler;
