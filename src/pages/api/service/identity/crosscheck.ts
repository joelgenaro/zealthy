import { Database } from '@/lib/database.types';
import { NonNullableFields } from '@/types/utils/required';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';
import { crossCheckVerification } from './utils/crossCheckVerification';
import { getServiceSupabase } from '@/utils/supabase';

const getPatientProfile = (profile: Profile) => {
  const requiredKeys = [
    'birth_date',
    'phone_number',
    'last_name',
    'first_name',
    'email',
  ];

  if (requiredKeys.some(key => !profile[key as keyof Profile])) {
    throw new Error(
      `Patient does not have one or more of following attributes ${requiredKeys.join(
        ', '
      )}`
    );
  }

  return profile as NonNullableFields<Profile>;
};

const PATIENT_QUERY = `
  vouched_verified, 
  profile:profiles(
    email,
    phone_number,
    first_name,
    last_name,
    birth_date
  )
`;

type Profile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'email' | 'last_name' | 'first_name' | 'phone_number' | 'birth_date'
>;
type Patient = Pick<
  Database['public']['Tables']['patient']['Row'],
  'vouched_verified'
> & {
  profile?: Profile;
};

export default async function CrossCheckHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(400).json({
      message: 'You are in the wrong place!!!',
    });
  }

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
      supabase = getServiceSupabase();
    }

    const { patientId } = req.body as { patientId: number };
    const [patient, address] = await Promise.all([
      supabase
        .from('patient')
        .select(PATIENT_QUERY)
        .eq('id', patientId)
        .maybeSingle()
        .then(({ data }) => data as Patient | null),

      supabase
        .from('address')
        .select('*')
        .eq('patient_id', patientId)
        .limit(1)
        .maybeSingle()
        .then(({ data }) => data),
    ]);

    if (!patient?.profile || !address) {
      throw new Error(`Patient ${patientId} does not have profile or address`);
    }

    //check if patient already completed Vouched
    if (patient.vouched_verified) {
      console.log({
        message: `Patient ${patientId} already verified ID with Vouched`,
        zealthy_patient_id: patientId,
      });

      return res.status(200).json({
        verified: true,
        isOlderThan24: true,
      });
    }

    //convert optional filed to required
    const patientProfile = getPatientProfile(patient.profile);

    const { verified, isOlderThan24, status } = await crossCheckVerification(
      patientId,
      patientProfile,
      address
    );

    if (verified && isOlderThan24) {
      //mark patient as vouched_verified and return
      await supabase
        .from('patient')
        .update({
          vouched_verified: true,
          has_verified_identity: true,
        })
        .eq('id', patientId);
    }

    return res.status(status).json({
      verified,
      isOlderThan24,
    });
  } catch (err: any) {
    console.error('crosscheck_err', err);
    return res
      .status(422)
      .json(err?.message || 'There was an unexpected error');
  }
}
