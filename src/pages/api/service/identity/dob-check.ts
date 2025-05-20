import { Database } from '@/lib/database.types';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import axios, { AxiosError, isAxiosError } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default async function DOBCheckHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(400).json({
      message: 'You are in the wrong place!!!',
    });
  }

  try {
    const supabase = createServerSupabaseClient<Database>({ req, res });

    // Check if we have a session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session)
      return res.status(401).json({
        message: 'not_authenticated',
        description:
          'The user does not have an active session or is not authenticated',
      });

    const { patientId } = req.body;

    const endpoint = 'https://verify.vouched.id/api/dob/verify';

    const [profile, address] = await Promise.all([
      supabase
        .from('patient')
        .select('*, profiles(*)')
        .eq('id', patientId)
        .maybeSingle()
        .then(({ data }) => data?.profiles as Profile | null),

      supabase
        .from('address')
        .select('*')
        .eq('patient_id', patientId)
        .limit(1)
        .maybeSingle()
        .then(({ data }) => data),
    ]);

    const data = {
      email: profile?.email,
      phone: profile?.phone_number?.replace('+1', ''),
      firstName: profile?.first_name,
      lastName: profile?.last_name,
      dob: new Date(profile?.birth_date!),
      address: {
        streetAddress: address?.address_line_1,
        unit: address?.address_line_2,
        city: address?.city,
        state: address?.state,
        postalCode: address?.zip_code,
        country: 'US',
      },
    };

    const response = await axios.post(endpoint, data, {
      headers: {
        'x-api-key': process.env.VOUCHED_PRIVATE_KEY,
      },
    });

    return res.status(response.status).json(response.data.result);
  } catch (err: any) {
    if (
      isAxiosError(err) &&
      (err as AxiosError)?.response &&
      (err as AxiosError)?.response?.status === 400
    ) {
      return res.status(200).json({ dobMatch: false });
    }
    return res
      .status(422)
      .json(err?.message || 'There was an unexpected error');
  }
}
