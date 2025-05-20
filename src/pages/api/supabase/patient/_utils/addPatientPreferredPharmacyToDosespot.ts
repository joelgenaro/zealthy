import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createDosespotToken } from '@/pages/api/utils/dosespot-token';
import axios, { AxiosRequestConfig } from 'axios';
import { addPharmacyToPatientInDosespot } from './addPharmacyToPatientInDosespot';

type DosespotSearchPharmaciesResult = {
  Items: {
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
  }[];
};

const buildPharmacy = (
  pharmacy: DosespotSearchPharmaciesResult['Items'][0]
) => ({
  name: pharmacy.StoreName,
  id: pharmacy.PharmacyId,
  zip_code: pharmacy.ZipCode,
  address1: pharmacy.Address1,
  city: pharmacy.City,
});

export const addPatientPreferredPharmacyToDosespot = async (
  patientId: number,
  dosespotPatientId: number
) => {
  const preferredPharmacy = await supabaseAdmin
    .from('patient_pharmacy')
    .select('*')
    .eq('patient_id', patientId)
    .limit(1)
    .maybeSingle()
    .then(({ data }) => data);

  if (!preferredPharmacy) {
    return `Patient ${patientId} does not have preferred pharmacy`;
  }

  if (!preferredPharmacy.pharmacy) {
    throw new Error(
      `Pharmacy for patient ${preferredPharmacy.patient_id} is missing address`
    );
  }

  const [street, city, stateZipcode] =
    preferredPharmacy.pharmacy?.split(', ') || [];
  const [state, zipcode] = stateZipcode?.split(' ') || [];

  //create access token
  const { data: token } = await createDosespotToken();

  const options: AxiosRequestConfig = {
    method: 'GET',
    url: `${process.env
      .DOSESPOT_BASE_URL!}/webapi/api/pharmacies/search?address=${street}&city=${city}&state=${state}&zip=${zipcode}`,
    headers: {
      Authorization: `Bearer ${token.access_token}`,
    },
  };

  const { data: pharmacy } = await axios<DosespotSearchPharmaciesResult>(
    options
  );

  if (pharmacy?.Items?.length) {
    const pharmacies = pharmacy.Items.filter(
      p => p.ZipCode.slice(0, 5) === zipcode
    );

    if (pharmacies.length !== 1) {
      console.log({
        PHARMACIES: JSON.stringify(pharmacies.map(buildPharmacy)),
      });
      throw new Error(
        `Patient ${patientId}. ${
          pharmacies.length > 1 ? 'More than 1' : 'No'
        } pharmacy were found for specified location ${zipcode}`
      );
    }

    return addPharmacyToPatientInDosespot(
      dosespotPatientId,
      pharmacies[0].PharmacyId,
      true
    );
  }

  throw new Error(
    `Patient ${patientId}. Could not find pharmacy for specified location ${zipcode}`
  );
};
