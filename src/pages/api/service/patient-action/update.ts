import { Database } from '@/lib/database.types';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';

type PatientActionItemUpdate =
  Database['public']['Tables']['patient_action_item']['Update'] & {
    patient_id: number;
    type: string;
  };

export default async function handlerPatientActionUpdate(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { patient_id, type, id, ...updates } =
    req.body as PatientActionItemUpdate;

  try {
    // create supabase client
    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    if (!patient_id && !type) {
      throw new Error(`Patient id and or type was not provided by required`);
    }

    let query = supabase.from('patient_action_item').update(updates);

    if (id) {
      query = query.eq('id', id);
    }

    const item = await query
      .eq('type', type)
      .eq('patient_id', patient_id)
      .select();

    res.status(item.status).json(item.data);
  } catch (err: any) {
    console.error('patient-action-update-err', err);
    res.status(422).json(err?.message || 'There was an unexpected error');
  }
}
