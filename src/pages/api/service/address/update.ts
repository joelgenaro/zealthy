import { Database } from '@/lib/database.types';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { AxiosError, isAxiosError } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export type UpdateAddressParams = {
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  zip_code: string;
  patient_id: number;
};

export default async function UpdateAddressHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(400).json({
      message: 'You are in the wrong place!!!',
    });
  }

  const { address_line_1, address_line_2, city, state, zip_code, patient_id } =
    req.body as UpdateAddressParams;

  try {
    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    if (!patient_id) {
      throw new Error(`Patient id is required`);
    }
    const userId = await supabase
      .from('patient')
      .select('profile_id')
      .eq('id', patient_id)
      .single()
      .then(({ data }) => data?.profile_id);

    const [address] = await Promise.all([
      //insert address
      supabase
        .from('address')
        .upsert({
          patient_id,
          address_line_1,
          address_line_2,
          city,
          state,
          zip_code,
        })
        .select('*')
        .throwOnError()
        .then(({ data }) => data),

      //update prescription requests
      supabase
        .from('prescription_request')
        .update({
          region: state,
        })
        .eq('patient_id', patient_id),

      //update patient
      supabase
        .from('patient')
        .update({
          region: state,
        })
        .eq('id', patient_id),
    ]);

    return res.status(200).json(address);
  } catch (err) {
    let message = `UPDATED ADDRESS ERROR: ${(err as Error).message}`;

    if (isAxiosError(err)) {
      message =
        `UPDATED ADDRESS ERROR: ${JSON.stringify(
          (err as AxiosError)?.response?.data
        )}` || message;
    }

    return res.status(422).json({ message });
  }
}
