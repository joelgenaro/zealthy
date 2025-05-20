import { PatientProps } from '@/components/hooks/data';
import { Database } from '@/lib/database.types';
import axios from 'axios';
import { phoneDigitsOnly } from '../phoneDigitsOnly';

type RevivePatientCreateResponse = {
  contact_id: number;
  messages: [
    {
      message: string;
      type: string;
    }
  ];
  patient_id: number;
  success: boolean;
};
export const createRevivePatient = async (
  patient: PatientProps,
  patientAddress: Database['public']['Tables']['address']['Row']
) => {
  const bodyParams = {
    method: 'POST',
    url:
      process.env.REVIVE_BASE_URL +
      '/api/v5/provider_portal/patient/create_new',
    headers: {
      'x-pmk-authentication-token': process.env.REVIVE_API_KEY,
    },
    data: {
      active: true,
      address: [
        {
          city: patientAddress?.city,
          country: 'US',
          line: [
            patientAddress?.address_line_1,
            patientAddress?.address_line_2 ?? '',
          ],
          postalCode: patientAddress?.zip_code,
          state: patientAddress?.state,
          data: {},
        },
      ],
      birthDate: patient?.profiles?.birth_date,
      gender: patient?.profiles?.gender,
      name: [
        {
          family: patient?.profiles?.last_name,
          given: [patient?.profiles?.first_name],
          use: 'official',
        },
      ],
      resourceType: 'Patient',
      telecom: [
        {
          system: 'phone',
          value: phoneDigitsOnly(patient?.profiles?.phone_number ?? ''),
          use: 'primary',
        },
        {
          system: 'email',
          value: patient?.profiles?.email ?? '',
        },
      ],

      clinic_identifier: process.env.REVIVE_CLINIC_IDENTIFIER,
      practitioner_identifier: process.env.REVIVE_PRACTITIONER_IDENTIFIER,
    },
  };

  const { data: newPatient } = await axios<RevivePatientCreateResponse>(
    bodyParams
  );

  if (!newPatient?.patient_id)
    throw new Error(`Unable to create Revive patient for ${patient?.id}`);
  console.log(
    `Successfully created revive patient: ${newPatient?.patient_id} for Patient ${patient?.id}`
  );

  return newPatient?.patient_id;
};
