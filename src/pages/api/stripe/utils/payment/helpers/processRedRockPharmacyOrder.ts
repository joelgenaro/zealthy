import { PatientProps, OrderPrescriptionProps } from '@/components/hooks/data';
import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import axios, { AxiosError, isAxiosError } from 'axios';
import format from 'date-fns-tz/formatInTimeZone';

type RedRockPatientResponse = {
  MESSAGES: string;
  PATIENTID: string;
  PATIENTNAME: string;
  PATIENTDOB: string;
  PATIENTNUMBER: string;
  CHARGEACCOUNTID: string;
};

type RedRockOrderResponse = {
  PRESCRIPTIONTRANID: string;
  PRESCRIPTIONRXID: string;
  PRESCCRIPTIONBILLNO: string;
  PATIENTNAME: string;
  PATIENTDOB: string;
  PRESCRIBERNAME: string;
  DRUGNAME: string;
};

const getRedRockPrescriberId = (region: string) => {
  return ['CA', 'NV'].includes(region)
    ? process.env.RED_ROCK_DEFAULT_ST_GEORGE_PRESCRIBER_ID
    : process.env.RED_ROCK_DEFAULT_SPRINGVILLE_PRESCRIBER_ID;
};

const getRedRockBasedURL = (region: string) => {
  return ['CA', 'NV'].includes(region)
    ? process.env.RED_ROCK_BASE_ST_GEORGE_URL
    : process.env.RED_ROCK_BASE_SPRINGVILLE_URL;
};

const getFacilityID = (region: string) => {
  const id = ['CA', 'NV'].includes(region)
    ? process.env.RED_ROCK_CA_NV_FACILITY_ID
    : process.env.RED_ROCK_ALL_OTHER_FACILITY_ID;
  return Number(id);
};

const getChargeAccountId = (region: string) => {
  const id = ['CA', 'NV'].includes(region)
    ? process.env.RED_ROCK_CA_NV_CHARGE_ACCOUNT_ID
    : process.env.RED_ROCK_ALL_OTHER_CHARGE_ACCOUNT_ID;
  return Number(id);
};

const getStoreId = (region: string) => {
  const id = ['CA', 'NV'].includes(region)
    ? process.env.RED_ROCK_ST_GEORGE_STORE_ID
    : process.env.RED_ROCK_SPRINGVILLE_STORE_ID;
  return Number(id);
};

export const processRedRockPharmacyOrder = async (
  patient: PatientProps,
  existingOrder: OrderPrescriptionProps,
  patientAddress: Database['public']['Tables']['address']['Row'] | null
) => {
  if (
    existingOrder.red_rock_order_id ||
    existingOrder.order_status === 'SENT_TO_RED_ROCK'
  ) {
    return existingOrder.red_rock_order_id;
  }

  if (!existingOrder.prescription?.medication_id) {
    throw new Error(`DrugId for Order ${existingOrder.id} was not provided`);
  }

  const baseURL = getRedRockBasedURL(patient.region || '');
  const timeZone = 'America/Denver';

  try {
    //create token
    const { data: access_token } = await axios
      .post(`${baseURL}/auth/authenticate`, {
        username: process.env.RED_ROCK_USERNAME,
        password: process.env.RED_ROCK_PASSWORD,
      })
      .catch(err => {
        console.log({
          RED_ROCK_ERROR: (err as AxiosError).response?.data,
        });
        throw err;
      });

    let redRockPatientId = patient.red_rock_patient_id;
    let facilityId = patient.red_rock_facility_id;
    let chargeAccountId = patient.red_rock_charge_account_id;
    let storeId = patient.red_rock_store_id;

    if (!facilityId) {
      facilityId = getFacilityID(patient.region || '');
    }

    if (!chargeAccountId) {
      chargeAccountId = getChargeAccountId(patient.region || '');
    }

    if (!storeId) {
      storeId = getStoreId(patient.region || '');
    }

    //create red rock patient if not already
    if (!redRockPatientId) {
      const patientData = {
        storeId,
        entity: 'patient',
        field: [
          `PATIENTEXTERNALID:${patient.id}`,
          `PATIENTEMAIL:${patient.profiles.email}`,
          `PATIENTFIRSTNAME:${patient?.profiles?.first_name}`,
          `PATIENTLASTNAME:${patient?.profiles?.last_name}`,
          `PATIENTDOB:${patient?.profiles?.birth_date}`,
          `PATIENTADDRESS:${patientAddress?.address_line_1}`,
          `PATIENTADDRESS2:${patientAddress?.address_line_2}`,
          `PATIENTZIPCODE:${patientAddress?.zip_code}`,
          `PATIENTCITY:${patientAddress?.city}`,
          `PATIENTSTATE:${patientAddress?.state}`,
          'PATIENTPROFILEONLY:Y',
          `PATIENTGENDER:${patient?.profiles?.gender}`,
          `PATIENTHOMEPHONE:${
            patient?.profiles?.phone_number || '+11111111111'
          }`,
          `FACILITYID:${facilityId}`,
          `PRIMARYCHARGEACCOUNTID:${chargeAccountId}`,
        ],
      };

      const { data: redRockPatient } = await axios.post<RedRockPatientResponse>(
        `${baseURL}/v3/IPS`,
        patientData,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      if (!redRockPatient.PATIENTID) {
        throw new Error(
          `Could not find PATIENTID in response body ${JSON.stringify(
            redRockPatient
          )} from ${baseURL}`
        );
      }

      redRockPatientId = Number(redRockPatient.PATIENTID);
    }

    await supabaseAdmin
      .from('patient')
      .update({
        red_rock_patient_id: redRockPatientId,
        red_rock_facility_id: facilityId,
        red_rock_charge_account_id: chargeAccountId,
        red_rock_store_id: storeId,
      })
      .eq('id', patient.id);

    //find DR. Erchevery
    const prescriberRedRockId = getRedRockPrescriberId(patient.region || '');

    const sig = `${
      existingOrder?.prescription?.dosage_instructions || 'Take as instructed'
    }. *THIS IS A COMPOUNDED MEDICATION. STORE IN REFRIGERATOR. DISCARD 28 DAYS AFTER FIRST VIAL PUNCTURE*`;

    //create a Red Rock order
    const orderParams = {
      storeId,
      entity: 'prescription',
      field: [
        `PRESCRIPTIONEXTERNALRXID:${existingOrder.id}`,
        `PRESCRIPTIONTRANDATE:${format(new Date(), timeZone, 'yyyy-MM-dd')}`,
        `PATIENTID:${redRockPatientId}`,
        `PRESCRIBERID:${prescriberRedRockId}`,
        `DRUGID:${existingOrder.prescription.medication_id}`,
        `PRESCRIPTIONFILLID:${existingOrder.prescription.medication_id}`,
        `PRESCRIPTONORIGINALQTY:${existingOrder.prescription.dispense_quantity}`,
        `PRESCRIPTIONFILLQTY:${existingOrder.prescription.dispense_quantity}`,
        `PRESCRIPTIONSIGCODE:${sig}`,
        `PRESCRIPTIONDAYSSUPPLY:28`,
        'PRESCRIPTIONORIGINALREFILL:0',
        'PRESCRIPTIONTYPEID:O',
        'PRESCRIPTIONOTC:N',
        'PRESCRIPTIONFILL:Y',
        'PRESCRIPTIONBILL:Y',
      ],
    };

    const { data: redRockOrder } = await axios.post<RedRockOrderResponse>(
      `${baseURL}/v3/IPS`,
      orderParams,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!redRockOrder.PRESCRIPTIONTRANID) {
      throw new Error(
        `Could not find PRESCRIPTIONTRANID in response body ${JSON.stringify(
          redRockOrder
        )} from ${baseURL}`
      );
    }

    await supabaseAdmin
      .from('order')
      .update({
        order_status: `SENT_TO_RED_ROCK`,
        red_rock_order_id: Number(redRockOrder.PRESCRIPTIONTRANID),
      })
      .eq('id', existingOrder?.id);
    return redRockOrder.PRESCRIPTIONTRANID;
  } catch (err) {
    let message = (err as Error).message;

    if (isAxiosError(err)) {
      message = JSON.stringify((err as AxiosError).response?.data);
    }

    throw new Error(
      `RED_ROCK_ERROR: ${message}. Date and time of Error: ${format(
        new Date(),
        timeZone,
        'yyyy-MM-dd HH:mm:ss zzz'
      )}`
    );
  }
};
