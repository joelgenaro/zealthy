import { Database } from '@/lib/database.types';
import { NonNullableFields } from '@/types/utils/required';
import axios from 'axios';
import differenceInYears from 'date-fns/differenceInYears';
import { dobVerification } from './dobVerification';

type Profile = NonNullableFields<
  Pick<
    Database['public']['Tables']['profiles']['Row'],
    'email' | 'last_name' | 'first_name' | 'phone_number' | 'birth_date'
  >
>;
type Address = Database['public']['Tables']['address']['Row'];

type VouchedCrossCheckResponse = {
  result: {
    confidences: {
      identity: number;
    };
    ageRange: {
      from: number;
      to: number;
    } | null;
  };
};

type VouchedCrossCheckPayload = {
  dob?: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  address: {
    streetAddress: string | null;
    unit: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: 'US';
  };
};

export const crossCheckVerification = async (
  patientId: number,
  profile: Profile,
  address: Address
) => {
  const age = differenceInYears(Date.now(), new Date(profile.birth_date));

  if (age < 24) {
    console.log({
      message: `Patient ${patientId} is younger than 24. Skipping ID verification with Vouched`,
      zealthy_patient_id: patientId,
    });

    return {
      verified: false,
      isOlderThan24: false,
      status: 200,
    };
  }

  const endpoint = 'https://verify.vouched.id/api/identity/crosscheck';

  const data: VouchedCrossCheckPayload = {
    email: profile.email,
    phone: profile.phone_number,
    firstName: profile.first_name,
    lastName: profile.last_name,
    address: {
      streetAddress: address?.address_line_1,
      unit: address?.address_line_2,
      city: address?.city,
      state: address?.state,
      postalCode: address?.zip_code,
      country: 'US',
    },
  };

  const { status, data: response } =
    await axios.post<VouchedCrossCheckResponse>(endpoint, data, {
      headers: {
        'x-api-key': process.env.VOUCHED_PRIVATE_KEY,
      },
    });

  const verified = response.result.confidences.identity >= 0.8;
  let isOlderThan24 = false;

  if (!response.result.ageRange) {
    //check if patient provided correct DOB
    const { data: dobResponse } = await dobVerification(
      patientId,
      profile,
      address
    );

    if (dobResponse.result.dobMatch && age >= 24) {
      isOlderThan24 = true;
    }
  } else {
    isOlderThan24 = response.result.ageRange.from >= 24;
  }

  console.log({
    level: 'info',
    message: `Vouched results for crosscheck: Verified - ${verified}, isOlderThan24 - ${isOlderThan24}`,
    vouched_identity_score: response.result.confidences.identity,
    vouched_ageRange: `From: ${response.result.ageRange?.from} to ${response.result.ageRange?.to}`,
    zealthy_patient_id: patientId,
  });

  return {
    verified,
    isOlderThan24,
    status,
  };
};
