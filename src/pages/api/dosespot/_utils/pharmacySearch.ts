import axios, { AxiosError, AxiosRequestConfig, isAxiosError } from 'axios';
import { createDosespotToken } from './createDosespotToken';

const getErrorMessage = (err: unknown) => {
  let message = (err as Error).message;
  if (isAxiosError(err)) {
    message = JSON.stringify((err as AxiosError)?.response?.data);
  }

  return message;
};

export type DosespotPharmacy = {
  PharmacyId: number;
  StoreName: string;
  Address1: string;
  Address2: string;
  City: string;
  State: string;
  ZipCode: string;
  PrimaryPhone: string;
  PrimaryPhoneType: number;
  PrimaryFax: string;
  PhoneAdditional1: null;
  PhoneAdditionalType1: number;
  PhoneAdditional2: null;
  PhoneAdditionalType2: number;
  PhoneAdditional3: null;
  PhoneAdditionalType3: number;
  PharmacySpecialties: any[];
  ServiceLevel: number;
  Latitude: number;
  Longitude: number;
};

type DosespotSearchPharmaciesResult = {
  Items: DosespotPharmacy[];
};

type Query = {
  phoneOrFax?: string;
  address?: string;
  zip: string;
  state?: string;
  city?: string;
  name?: string;
};

export const getDosespotPharmacies = async (query: Query) => {
  try {
    console.log({ QUERY: query });

    //create token
    const { data: token } = await createDosespotToken();

    const options: AxiosRequestConfig = {
      method: 'GET',
      url: `${process.env
        .DOSESPOT_BASE_URL!}/webapi/v2/api/pharmacies/search?${new URLSearchParams(
        query
      )}`,
      headers: {
        'Subscription-Key': process.env.DOSESPOT_SUBSCRIPTION_KEY,
        Authorization: `Bearer ${token.access_token}`,
      },
    };

    //search pharmacies
    const { data: pharmacy } = await axios<DosespotSearchPharmaciesResult>(
      options
    );

    console.log({ pharmacy });

    return pharmacy.Items;
  } catch (err) {
    const message = getErrorMessage(err);
    console.log({ ERROR: message });
    throw new Error(message);
  }
};
