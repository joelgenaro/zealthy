import { createDosespotToken } from '@/pages/api/utils/dosespot-token';
import axios, { AxiosRequestConfig } from 'axios';

type AddPharmacyToPatientResult = {
  Result: {
    ResultCode: 'ERROR' | 'OK';
    ResultDescription: string;
  };
};

export const addPharmacyToPatientInDosespot = async (
  dosespotPatientId: number,
  dosespotPharmacyId: number,
  asPrimary: boolean = false
) => {
  if (!dosespotPharmacyId) {
    throw new Error(`Pharmacy ID was not provided`);
  }

  //create access token
  const { data: token } = await createDosespotToken();

  const options: AxiosRequestConfig = {
    method: 'POST',
    url: `${process.env
      .DOSESPOT_BASE_URL!}/webapi/api/patients/${dosespotPatientId}/pharmacies/${dosespotPharmacyId}`,
    data: {
      SetAsPrimary: asPrimary,
    },
    headers: {
      Authorization: `Bearer ${token.access_token}`,
    },
  };

  const { data: pharmacy } = await axios<AddPharmacyToPatientResult>(options);

  if (pharmacy.Result.ResultCode === 'ERROR') {
    throw new Error(
      pharmacy.Result.ResultDescription ||
        `Could not add Pharmacy to ${process.env.DOSESPOT_GOGOMEDS_PHARMACY_ID}`
    );
  }

  return pharmacy.Result.ResultCode;
};
