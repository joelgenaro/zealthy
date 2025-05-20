import { Database } from '@/lib/database.types';
import axios, { AxiosError, isAxiosError } from 'axios';
import { NonNullableFields } from '@/types/utils/required';

type Profile = NonNullableFields<
  Pick<
    Database['public']['Tables']['profiles']['Row'],
    'email' | 'last_name' | 'first_name' | 'phone_number' | 'birth_date'
  >
>;
type Address = Database['public']['Tables']['address']['Row'];

type VouchedDOBPayload = {
  dob: string;
  email: string | null;
  phone: string;
  firstName: string;
  lastName: string;
  address: {
    streetAddress: string | null;
    unit: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: 'US';
  };
};

type VouchedDOBResponse = {
  result: { dobMatch: boolean };
};

export const dobVerification = async (
  patientId: number,
  profile: Profile,
  address: Address
) => {
  try {
    //check if patient provided correct DOB
    const data: VouchedDOBPayload = {
      dob: new Date(profile.birth_date!).toISOString(),
      phone: profile.phone_number.replace('+1', ''),
      email: profile.email,
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

    const response = await axios.post<VouchedDOBResponse>(
      'https://verify.vouched.id/api/dob/verify',
      data,
      {
        headers: {
          'x-api-key': process.env.VOUCHED_PRIVATE_KEY,
        },
      }
    );

    console.log({
      message: `Vouched results for dob-check: dobMatch: ${response.data.result.dobMatch}`,
      zealthy_patient_id: patientId,
    });

    return response;
  } catch (err) {
    if (
      isAxiosError(err) &&
      (err as AxiosError)?.response &&
      (err as AxiosError)?.response?.status === 400
    ) {
      const errorMessage = (err as AxiosError<Record<string, any>>).response
        ?.data?.errors?.[0].message;

      console.log({
        message: `Vouched results for dob-check: Bad request`,
        vouched_error: errorMessage,
        zealthy_patient_id: patientId,
      });

      return { data: { result: { dobMatch: false } } };
    }

    throw err;
  }
};
