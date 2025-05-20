import { Database } from '@/lib/database.types';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import axios from 'axios';
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
    const endpoint = 'https://verify.vouched.id/api/dob';

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
      phone: profile?.phone_number || '000-111-2222',
      firstName: profile?.first_name,
      lastName: profile?.last_name,
      dob: new Date(profile?.birth_date!).toISOString(),
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

    return res.status(response.status).json(response.data);
  } catch (err: any) {
    console.log('dobcheck_err', err);
    return res
      .status(422)
      .json(err?.message || 'There was an unexpected error');
  }
}
