import { Database } from '@/lib/database.types';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handlerPatientActionCreate(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { path, patient_id, title, body, type } =
    req.body as Database['public']['Tables']['patient_action_item']['Insert'];

  try {
    // create supabase client
    const supabase = createServerSupabaseClient<Database>({ req, res });

    const item = await supabase
      .from('patient_action_item')
      .insert({
        patient_id,
        title,
        type,
        body,
        path,
      })
      .maybeSingle();

    res.status(item.status).json(item.data);
  } catch (err) {
    console.error('patient-action-err', err);
    res.status(422).json(err);
  }
}
