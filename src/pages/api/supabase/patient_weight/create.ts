import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseWebhookHandlerWrapper } from '../../wrappers/supabaseWebhookWrapper';

type Weight = Database['public']['Tables']['patient_weight']['Row'];

type InsertPayload = {
  type: 'INSERT';
  table: string;
  schema: string;
  record: Weight;
  old_record: null;
};

/**
 * @description this function is being called from supabase directly
 * every time record is created in patient-weight table
 */

const handlePatientWeightInsert = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { record } = req.body as InsertPayload;

    //update patient with latest weight
    await supabaseAdmin
      .from('patient')
      .update({
        weight: record.weight,
      })
      .eq('id', record.patient_id!);

    res.status(200).json({
      message: 'OK',
    });
  } catch (err: any) {
    console.error('patient_weight_err', err);
    res.status(422).json({
      error: err?.message || 'There was an unexpected error',
    });
  }
};

export default async function CreateVitals(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return supabaseWebhookHandlerWrapper(req, res, handlePatientWeightInsert);
}
