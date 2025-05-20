import { Database } from '@/lib/database.types';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { AxiosError } from 'axios';
import { ExtractionResultsDto } from 'butler-sdk';
import { NextApiRequest, NextApiResponse } from 'next';
import butlerClient from '../../butler/createClient';

type ErrorType = {
  message: string;
  description?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtractionResultsDto | ErrorType>
) {
  try {
    let supabase = createServerSupabaseClient<Database>({ req, res });

    // Check if we have a session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    //temp workaround
    if (!session) {
      const apiKey = req.headers['x-kob-zlt-tkn'];
      if (process.env.KOB_TOKEN !== apiKey) {
        return res.status(401).json({
          message: 'not_authenticated',
          description:
            'The user does not have an active session or is not authenticated',
        });
      }
    }
    const { insurance } = req.body;

    const base64 = await fetch(insurance.fileToUpload);
    const blob = await base64.blob();

    const formData = new FormData();
    formData.append('file', blob, insurance.fileName);

    const { data } = await butlerClient.post<ExtractionResultsDto>(
      `/queues/${process.env.BUTLER_LAB_QUEUE_ID}/documents`,
      formData
    );

    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ message: (err as AxiosError).message });
  }
}
