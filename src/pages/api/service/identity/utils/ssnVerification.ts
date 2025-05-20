import { Database } from '@/lib/database.types';
import axios, { AxiosError, isAxiosError } from 'axios';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Address = Database['public']['Tables']['address']['Row'];
type VouchedSSNResponse = {
  result: { ssnMatch: boolean };
};

export const ssnVerification = async (
  ssn: string,
  patientId: number,
  profile: Profile,
  address: Address
) => {
  const endpoint = 'https://verify.vouched.id/api/private-ssn/verify';

  try {
    const data = {
      ssn,
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

    const response = await axios.post<VouchedSSNResponse>(endpoint, data, {
      headers: {
        'x-api-key': process.env.VOUCHED_PRIVATE_KEY,
      },
    });

    console.log({
      level: 'info',
      message: `Vouched results for ssn-check: ssnMatch: ${response.data.result.ssnMatch}`,
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
        message: `Vouched results for ssn-check: Bad request`,
        vouched_error: errorMessage,
        zealthy_patient_id: patientId,
      });

      return { data: { result: { ssnMatch: false } }, status: 200 };
    }

    throw err;
  }
};
